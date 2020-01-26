let cfg = require('../config.json')
const express = require('express');
const router = express.Router();
const checkAuth = require('../check_auth');
const getDb = require('../db').getDb;
let db = getDb();
const jwt = require('jsonwebtoken');
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug'; // Levels: (ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF)

/**
 * If account data is requested. Only for logged in users.
 */
router.get('/', checkAuth, (req, res) => {
    let id = req.user_id;
    let first = req.first_name;
    let last = req.last_name;

    const sql = 'select * from user where id=$id';

    db.serialize(function () {
        let stmt = db.prepare(sql);
        let resultUser = {};
        let preparedParameter = {
            $id: id
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
                    "message": "Retrieving account data failed. No such user."
                });
                logger.error('User with this id not found in DB. 401 response returned');
                return;
            }

            resultUser = rows[0];

            logger.debug('Account data found in DB: ', resultUser);

            res.status(200).json({
                "message": "Retrieving account data successful",
                "first_name": resultUser.first_name,
                "last_name": resultUser.last_name,
                "password": resultUser.password
            });
            logger.debug('response with account data sent');
            stmt.finalize();
        });
    });
});

/**
 * To update a logged-in users account data. Replace data, therefore PUT.
 */
router.put('/', checkAuth, (req, res) => {
    let first = req.body.firstName;
    let last = req.body.lastName;
    let pass = req.body.password;

    logger.debug(`User data update requested for user with id ${req.user_id}`);
    logger.debug(req.body);
    const sql = "update user set first_name=$first, last_name=$last, password=$password where id=$id;";

    db.serialize(function () {
        let stmt = db.prepare(sql);
        let resultUser = {};
        let preparedParameter = {
            $id: req.user_id,
            $first: first,
            $last: last,
            $password: pass
        };
        stmt.run(preparedParameter, function (error, rows) {
            if (error) {
                logger.error(error);
                res.status(401).json({message: "DB-Error occurred"});
                return;
            }
            console.log(`Rows updated: ${this.changes}`);

            // no results
            if (!this.changes) {
                res.status(401).json({
                    "message": "Updating account data failed."
                });
                logger.error('Update of account data failed. 401 response returned');
                return;
            }

            logger.debug('Account data successfully updated in DB');

            res.status(200).json({
                "message": "Update of account data successful",
                "number_of_rows_updated": this.changes
            });
            logger.debug('response with success message sent');
            stmt.finalize();
        });
    });
});

module.exports = router;
