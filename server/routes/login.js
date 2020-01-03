let cfg = require('../config.json')
const express = require('express');
const router = express.Router();
const getDb = require("../db").getDb;

router.post('/:email', (req, res) => {
    const db = getDb();
    let email = req.params.email;
    let pw = req.body.pass;
    /*
    * EX02 
    */
    db.query("SELECT password, first_name, last_name FROM users where email='" + email + "'", function (err, result, fields) {
        if (err) {
            res.status(400).json({ status:400, message: "an error occured" });
        }
        if(result.length == 0 || result === undefined) {
            res.status(401).json({ status:401, message: "login failed" });
        }
        if (pw == result.rows[0].password) {
            /*
            * Wenn der login erfolgreich war
            * erzeugen wir eine Zufallszahl (0-999998)
            */
            let token = Math.floor(Math.random() * 999999); 
            /*
            * Diese Zufallszahl setzen wir dann als token für den user,
            * indem wir ein UPDATE-Statement auf unsere DB ausführen
            */
            db.query("UPDATE users SET token='" + token + "' where email='" + email + "' and password='" + pw + "'", function (err, result) {
                if (err) { res.status(400).json({ status:400, message: "an error occured" });
                 }
            });
            /*
            * schlussendlich werden Vor- und Nachname sowie token zurückgegeben
            */
            res.status(200).json({ status:200, message: "login successful", "Data":{first_name:result.rows[0].first_name, last_name:result.rows[0].last_name, token:token}});
        } else {
            res.status(401).json({ status:401, message: "login failed" });
        }
    });
});

module.exports = router;
