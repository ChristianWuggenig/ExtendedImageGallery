let cfg = require('./config.json')
const getDb = require("./db").getDb;

module.exports = (req, res, next) => {
    const db = getDb();
    /*
    * EX02
    * 
    * Wir bekommen eine Anfrage. Im Authorization-Header befindet sich ein token, der uns dazu dienen soll, die session als gültig oder ugültig zu identifizieren.
    * Ob der token gültig ist prüfen wir, indem wir in der DB nach diesem token suchen
    */
    let token = req.headers.authorization;
    db.query("SELECT id FROM users where token='" + token + "'", function (err, result, fields) {
        if (err) {
            res.status(400).json({ message: "an error occured" });
        }
        /*
        * wenn wir das token finden und nur ein user diesen token hat, rufen wir next auf
        */
        if(result.length == 1){
            req.user_id = result[0].id;
            next();
        } else {
            res.status(401).json({message:"Not authorised!"});
        }
    });
};
