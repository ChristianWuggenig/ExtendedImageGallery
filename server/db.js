let cfg = require('./config.json')
let sqlite3 = require('sqlite3').verbose();

let _db;

let initDb = new Promise((resolve, reject) => {
    _db = new sqlite3.Database('./gallery.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            reject(err.message);
        }
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
