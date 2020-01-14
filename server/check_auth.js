let cfg = require('./config.json')
const getDb = require("./db").getDb;
const jwt = require('jsonwebtoken');
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug'; // Levels: (ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF)

module.exports = (req, res, next) => {
    const db = getDb();
    /*
    * EX02
    * 
    * Wir bekommen eine Anfrage. Im Authorization-Header befindet sich ein token, der uns dazu dienen soll, die session als gültig oder ugültig zu identifizieren.
    * Ob der token gültig ist prüfen wir, indem wir in der DB nach diesem token suchen
    */
    let token = req.headers.authorization;
    let sql = 'select * from user where token=$token';
    let preparedParams = {$token: token};
    let stmt = db.prepare(sql);
    stmt.all(preparedParams, function(error, rows) {
        if (error) {
            logger.error(error);
            next();
        }
        if (rows.length < 1) { // token not found in DB
            logger.error('Token not found in DB. rows.length=', rows.length);
            res.status(401).send({message: 'Not authorized to access this service'});
        }
        if (rows.length === 1){ // ok, exactly one user with that token
            logger.debug('Token found in DB. User already logged in');
            jwt.verify(token, cfg.auth.jwt_key, function(error, decoded) {
                if (error) {
                    logger.error(error);
                    res.status(401).json({message: 'Submitted JWT token could not be verified'})
                }
                req.user_id = decoded.payload.id;
                req.first_name = decoded.payload.first_name;
                req.last_name = decoded.payload.last_name;
            });
            next();
        }
    });

    // db.query("SELECT id FROM users where token='" + token + "'", function (err, result, fields) {
    //     if (err) {
    //         res.status(400).json({ message: "an error occured" });
    //     }
    //     /*
    //     * wenn wir das token finden und nur ein user diesen token hat, rufen wir next auf
    //     */
    //     if(result.length == 1){
    //         req.user_id = result[0].id;
    //         next();
    //     } else {
    //         res.status(401).json({message:"Not authorised!"});
    //     }
    // });
};
