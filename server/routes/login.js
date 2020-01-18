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

router.post('/', (req, res) => {
    let email = req.body.email;
    let pass = req.body.pass;

    logger.debug(`login requested with email: ${email} and password: ${pass}`);

    check_DB_for_login_data(email, pass, res);
});


// router.post('/:email', (req, res) => {
//     const db = getDb();
//     let email = req.params.email;
//     let pw = req.body.pass;
//
//     logger.debug(`POST :email + ${email}`);
//     /*
//     * EX02
//     */
//     db.query("SELECT password, first_name, last_name FROM users where email='" + email + "'", function (err, result, fields) {
//         if (err) {
//             res.status(400).json({ status:400, message: "an error occured" });
//         }
//         if(result.length == 0 || result === undefined) {
//             res.status(401).json({ status:401, message: "login failed" });
//         }
//         if (pw == result.rows[0].password) {
//             /*
//             * Wenn der login erfolgreich war
//             * erzeugen wir eine Zufallszahl (0-999998)
//             */
//             let token = Math.floor(Math.random() * 999999);
//             /*
//             * Diese Zufallszahl setzen wir dann als token für den user,
//             * indem wir ein UPDATE-Statement auf unsere DB ausführen
//             */
//             db.query("UPDATE users SET token='" + token + "' where email='" + email + "' and password='" + pw + "'", function (err, result) {
//                 if (err) { res.status(400).json({ status:400, message: "an error occured" });
//                  }
//             });
//             /*
//             * schlussendlich werden Vor- und Nachname sowie token zurückgegeben
//             */
//             res.status(200).json({ status:200, message: "login successful", "Data":{first_name:result.rows[0].first_name, last_name:result.rows[0].last_name, token:token}});
//         } else {
//             res.status(401).json({ status:401, message: "login failed" });
//         }
//     });
// });

module.exports = router;
