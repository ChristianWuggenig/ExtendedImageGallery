let cfg = require('../config.json')
const express = require('express');
const router = express.Router();
const getDb = require('../db').getDb;
let db = getDb();
const jwt = require('jsonwebtoken');
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug'; // Levels: (ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF)

function generateJWT(resultUser) {
    let payload = {first_name: resultUser.first_name, last_name: resultUser.last_name, id: resultUser.id};
    let token = jwt.sign({payload}, cfg.auth.jwt_key, {
        algorithm: 'HS256',
        expiresIn: cfg.auth.expiration
    });
    logger.debug('JWT generated:\n', token);
    return token;
}

function update_JWT_in_DB(token, resultUser) {
    let sql = 'update user set token=$token where id=$id';
    let stmt = db.prepare(sql);
    stmt.run({$token: token, $id: resultUser.id}, function (error) {
        if (error)
            logger.error(error);
        else logger.debug('Token updated in DB');
    });
}

function check_DB_for_login_data(email, pass, res) {
    const sql = 'select * from user where email=$email and password=$password';

    db.serialize(function () {
        let stmt = db.prepare(sql);
        let resultUser = {};
        let preparedParameter = {
            $email: email,
            $password: pass
        };
        stmt.all(preparedParameter, function (error, rows) {
            if (error) {
                logger.error(error);
                res.status(401).json({message: "DB-Error occurred"});
                return;
            }
            // no results
            if (rows.length < 1) {
                res.status(401).json({
                    "message": "Login failed. No such user."
                });
                logger.error('User with this email and password not found in DB. 401 response returned');
                return;
            }

            resultUser = rows[0];

            logger.debug('Login data found in DB: ', resultUser);

            let token = generateJWT(resultUser);
            update_JWT_in_DB(token, resultUser);

            res.status(200).json({
                "message": "login successful",
                "first_name": resultUser.first_name,
                "last_name": resultUser.last_name,
                "token": {token: token}
            });
            logger.debug('response with JWT sent');
            stmt.finalize();
        });
    });
}

/**
 * Login requested, check DB if data is valid
 */
router.post('/', (req, res) => {
    let email = req.body.email;
    let pass = req.body.pass;

    logger.debug(`login requested with email: ${email} and password: ${pass}`);

    check_DB_for_login_data(email, pass, res);
});

module.exports = router;
