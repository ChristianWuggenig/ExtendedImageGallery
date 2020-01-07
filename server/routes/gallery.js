const express = require('express');
const router = express.Router();
const checkAuth = require('../check_auth');
const getDb = require("../db").getDb;

router.get('/', checkAuth, (req, res) => {
    let db = getDb();
    /*
    * EX03
    * 
    * da wir eine DB-Anfrage (select statement) machen müssen, die etwas länger ist, schreiben wir sie
    * in eine extra Variable. Wir wollen id, url_big, url_small und description von images haben, wobei die user-id einen bestimmten
    * Wert haben muss, den wir mittels 'checkAuth' an req gebunden haben.
    */
    let sql = "SELECT i.id, i.url_big, i.url_small, i.description FROM images i, users_images ui where ui.user_id =" + req.user_id + " and i.id = ui.image_id";
    db.query(sql, function (err, result, fields) {
        if (err) {
            res.status(400).json({ message: "an error occured" });
        }
        if (result.length == 0) {
            /*
            * Ohne Rückgabewerte auch keine Daten --> Fehlercode 401
            */
            res.status(401).json({ message: "no results" });
        }
        /*
        * sonst erstellen wir ein leeres Array, das wir mit den Daten befüllen und danach in JSON umwandeln.
        */
        let jsonImgs = {};
        for (let i = 0; i < result.length; i++) {
            jsonImgs[result[i].id] = {
                "dataSmall": result[i].url_small,
                "dataBig": result[i].url_big,
                "description": result[i].description
            };
        }
        jsonImgs = JSON.stringify(jsonImgs);
        /*
        * zum Schluss geben wir noch 200 (=OK) als status gemeinsam mit dem json zurück
        */
        res.status(200).json(jsonImgs);
    });
});

router.get('/s', (req, res) => {
    if(req.query.searchString !== undefined) {
        let db = getDb();

        db.serialize(function () {
            let sql;
            if(req.query.searchString.startsWith("#")) {
                sql = db.prepare("select i.id, i.url_big, i.url_small, i.description from images i join images_tags it on i.id = it.image_id join tags t on t.id = it.tag_id where t.name like ? || '%'");
            } else {
                sql = db.prepare("select id, url_big, url_small, description from images where description like '%' || ? || '%'");
            }

            let images = {};
            sql.each(req.query.searchString, function (error, row) {

                images[row.id] = {
                    "dataSmall": row.url_small,
                    "dataBig": row.url_big,
                    "description": row.description
                }

                res.json(images);
                res.status(200);
                res.send();

            }, function (error, count) {
                sql.finalize();
            });


        });
    }
});

module.exports = router;
