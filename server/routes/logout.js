const express = require('express');
const router = express.Router();
const getDb = require('../db').getDb;
let db = getDb();
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug'; // Levels: (ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF)

function delete_JWT_from_DB(token, res) {
    let sql = 'update user set token=null where token=$token;';
    db.serialize(function () {
        let stmt = db.prepare(sql);
        stmt.run({$token: token}, function (error) {
            if (error) {
                logger.error(error);
                res.status(401).json({message: "Logout failed"});
                return;
            }
            else {
                logger.debug('Token deleted from DB. Server-side logout successful!');
                res.status(200).json({
                    "message": "Logout successful",
                });
            }
        });
        stmt.finalize();
    });
}

/**
 * On logout request, delete token from DB. User needs to login again to access service.
 */
router.delete('/', (req, res) => {
    let token = req.headers.authorization;
    logger.debug(`logout requested with token: ${token}`);
    delete_JWT_from_DB(token, res);
});

module.exports = router;
