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
        "from image";
    executeStandardQuery(sql, res);
});

/**
 * show a user's personal dashboard (first page shown when logged in)
 */
router.get('/favorites', checkAuth, (req, res) => {
    let sqltest = "select id, url_big, url_small, description " +
        "from image " +
        "where id = 5";
    let sql = "select i.id, i.url_big, i.url_small, i.description " +
        "from image i, users_images ui " +
        "where ui.user_id = ? and i.id = ui.image_id";

    executePreparedQuery(sqltest, req.user_id, res);
});

/**
 * search for images by description parts or tags
 */
router.get('/s', (req, res) => {
    let searchString = req.query.searchString;
    if(searchString !== undefined) {
        let sql;
        if(searchString.startsWith("@") && searchString.length > 1) {
            searchString = searchString.substr(1);
            sql = "select i.id, i.url_big, i.url_small, i.description " +
                "from image i " +
                "join images_tags it on i.id = it.image_id " +
                "join tag t on t.id = it.tag_id " +
                "where t.name like ? || '%'";
        } else if (!searchString.startsWith("@")){
            sql = "select id, url_big, url_small, description " +
                "from image " +
                "where description like '%' || ? || '%'";
        }

        if(sql !== undefined)
            executePreparedQuery(sql, searchString, res);
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

            res.json(JSON.stringify(images));
            res.status(200);
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

        res.json(JSON.stringify(images));
        res.status(200);
    });
}

module.exports = router;
