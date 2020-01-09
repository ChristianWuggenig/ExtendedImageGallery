const express = require('express');
const router = express.Router();
const checkAuth = require('../check_auth');
const getDb = require("../db").getDb;
let db = getDb();

/**
 * show all images (=landing page)
 */
router.get('/', (req, res) => {
    let sql = "select id, url_big, url_small, description " +
        "from images";

    executeStandardQuery(sql, res);
});

/**
 * show a user's personal dashboard (first page shown when logged in)
 */
router.get('/dashboard', checkAuth, (req, res) => {
    let sql = "select i.id, i.url_big, i.url_small, i.description " +
        "from images i, users_images ui " +
        "where ui.user_id =% and i.id = ui.image_id";

    executePreparedQuery(sql, req.user_id, res);
});

/**
 * search for images by description parts or tags
 */
router.get('/s', (req, res) => {
    if(req.query.searchString !== undefined) {
        let sql;
        if(req.query.searchString.startsWith("#")) {
            sql = "select i.id, i.url_big, i.url_small, i.description " +
                "from images i " +
                "join images_tags it on i.id = it.image_id " +
                "join tags t on t.id = it.tag_id " +
                "where t.name like ? || '%'";
        } else {
            sql = "select id, url_big, url_small, description " +
                "from images " +
                "where description like '%' || ? || '%'";
        }

        executePreparedQuery(sql, req.query.searchString, res);
    }
});

/**
 * execute a sql-query with a prepared statement, directly returning a json-file with images to the client
 * @param sql: the sql-query as string
 * @param preparedParameter: the parameter, which is used in the prepared statement
 * @param res: the response object
 */
function executePreparedQuery(sql, preparedParameter, res) {
    db.serialize(function () {
        sql = db.prepare(sql);
        let images = {};
        sql.each(preparedParameter, function (error, row) {
            images[row.id] = {
                "dataSmall": row.url_small,
                "dataBig": row.url_big,
                "description": row.description
            }
        }, function (error, count) {
            sql.finalize();

            if (Object.entries(images).length === 0 && images.constructor === Object) { //check if object is "empty"
                res.status(404);
            } else {
                res.json(JSON.stringify(images));
                res.status(200);
            }

            res.send();
        });
    });
}

/**
 * execute a standard query with no parameters
 * @param sql the sql-query
 * @param res the response-object
 */
function executeStandardQuery(sql, res) {
    let images = {};
    db.all(sql, [], (error, rows) => {
        if (error) {
            console.log(error);
        }
        rows.forEach((row) => {
            images[row.id] = {
                "dataSmall": row.url_small,
                "dataBig": row.url_big,
                "description": row.description
            }
        });

        if (Object.entries(images).length === 0 && images.constructor === Object) { //check if object is "empty"
            res.status(404);
        } else {
            res.json(JSON.stringify(images));
            res.status(200);
        }
    });
}

module.exports = router;
