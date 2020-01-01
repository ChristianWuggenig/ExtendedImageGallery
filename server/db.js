let cfg = require('./config.json')
let mysql = require('mysql');

let _db;

let initDb = new Promise((resolve, reject) => {

    // make sure to import 'db_import/galleryDB.sql' into your MySQL database first
    _db = mysql.createConnection({
      host     : cfg.database.host,
      user     : cfg.database.user,
      password : cfg.database.password,
      database : cfg.database.db
    });

    /*
    * EX01:
    * 
    * Um die DB-Verbindung aufzustellen muss <mysql import name>.connect(...) aufgerufen werden.
    * die connect-Methode bekommt eine Methode übergeben, die im Fehlerfall die verbindung rejected (reject) und ansonsten eine Verbindung aufbaut (resolve)
    */
    _db.connect(function(err) {
        if (err) {
            /*
            * Wenn ein Fehler auftritt, wird die Verbindungsanfrage abgelehnt.
            * (Testen durch Ändern des Passwortes)
            */
            reject();
            return;
        }
        /*fehler auftritt, resolven wir die Verbindungsanfrage.
        * Wenn kein 
        */
        console.log("Database is connected...");
        resolve();
      });
});

function getDb() {
    if (!_db) {
        console.log("Db has not been initialized. Please call init first.");
        return;
    }
    return _db;
}

module.exports = {
    getDb,
    initDb
};
