const express = require('express');
const router = express.Router();
const checkAuth = require('../check_auth');
const getDb = require("../db").getDb;
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug'; // Levels: (ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF)
const fs = require('fs');
const cfg = require('../config.json');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/uploaded/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})
var upload = multer({ storage: storage });
const resizeimage = require('sharp');
let db = getDb();

/**
 * Store an image in the images table in the database.
 * @param filepath disklocation of the image
 * @param res response object, only set in case of error
 */
function storeUploadInDB(filepath, res) {
    let sql = 'insert into image (url_big, url_small, description) values ($url_big, $url_small, $description);';
    db.serialize(function () {
        let stmt = db.prepare(sql);
        let preparedParameter = {
            $url_small: filepath.url_small,
            $url_big: filepath.url_big,
            $description: filepath.description
        };

        stmt.run(preparedParameter, function(err) {
            if (err) {
                logger.error(error);
                res.status(401).json({message: "DB-Error occurred at inserting uploaded file"});
                return console.log(err.message);
            }

            console.log(`A row has been inserted with rowid ${this.lastID}`);

            insertToTags(this.lastID, filepath.tags.split(','));
        });

        logger.debug('Upload successfully inserted into DB');

        stmt.finalize();
    });
};

/**
 * store the assigned tags of an image to the database
 * @param imageId the id of the new added image
 * @param tagsArray the array with the tags
 */
function insertToTags(imageId, tagsArray) {
    for (let i = 0; i < tagsArray.length; i++) { //do this for every tag
        sql = "select id from tag where name=?"; //see if the tag already exists in the db

        db.serialize(function () {
            sql = db.prepare(sql);
            let id = 0;
            sql.each(tagsArray[i], function (error, row) {
                id = row.id;
            }, function (error, count) {
                if(id === 0) { //if it does not exists, create a new entry in tag-table
                    let sql2 = "insert into tag(name) values(?)";
                    sql2 = db.prepare(sql2);

                    sql2.run(tagsArray[i], function(err) {
                        if (err) {
                            logger.error(error);
                            res.status(401).json({message: "DB-Error occurred at inserting uploaded file"});
                            return console.log(err.message);
                        }

                        insertToImagesTags(imageId, this.lastID); //link the image with the tag
                    });

                    sql2.finalize();
                } else {
                    insertToImagesTags(imageId, id); //link the image with the tag
                }
            });
        });
    }
}

/**
 * link an image with a tag in the images_tags table in the db
 * @param imageId the id of the image
 * @param tagId the id of the tag
 */
function insertToImagesTags(imageId, tagId) {
    let sql = 'insert into images_tags values($imageId, $tagId);';
    db.serialize(function () {
        let stmt = db.prepare(sql);
        let preparedParameter = {
            $imageId: imageId,
            $tagId: tagId
        };

        stmt.run(preparedParameter, function(err) {
            if (err) {
                logger.error(error);
                res.status(401).json({message: "DB-Error occurred at inserting uploaded file"});
                return console.log(err.message);
            }
        });

        stmt.finalize();
    });
}

/**
 * Upload an image to the server. Resize them so all our images have same width.
 * HTTP POST has to be of type multipart form-data
 */
router.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    logger.debug('Image upload request for file: ', req.file.filename);
    logger.debug('descriptop received: ', req.body.description);

    let oldFilePath = `./public/img/uploaded/${req.file.filename}`;
    let newFilePathBig = `./public/img/${req.file.filename}_big.jpg`;
    let newFilePathSmall = `./public/img/${req.file.filename}_small.jpg`;
    let newUrlSmall = `img/${req.file.filename}_small.jpg`;
    let newUrlBig = `img/${req.file.filename}_big.jpg`;
    let newDescription= req.body.description;
    let newTags = req.body.tags;

    resizeimage(`./public/img/uploaded/${req.file.filename}`)
        .resize({width: cfg.upload.width_big}) // our big images: width:3000, height:2000
        .toFile(newFilePathBig)
        .then(data => {
            logger.debug('Successfully resized upload to big image: ', data)
        })
        .catch(err => {
            logger.info('Error resizing upload to big image: ', err)
        });
    resizeimage(`./public/img/uploaded/${req.file.filename}`)
        .resize({width: cfg.upload.width_small}) // our small images: width:320, height:213
        .toFile(newFilePathSmall)
        .then(data => {
            logger.debug('Successfully resized upload to small image: ', data)
        })
        .catch(err => {
            logger.info('Error resizing upload to small image: ', err)
        });

    storeUploadInDB({url_big: newUrlBig, url_small: newUrlSmall, description: newDescription, tags: newTags}, res);
    res.status(200).json({message: `File ${req.file.filename} successfully uploaded`, details: 'Also stored in DB'});
});
/**
 * Add an image to users_images
 */

router.post('/favorites:image_id/:user_id',  checkAuth, (req, res) => {
    logger.debug('test received: ', req.body);
    let db = getDb();
    const sql = 'insert into users_images (user_id, image_id) values ($user_id, $image_id);';

    db.serialize(function () {
        let stmt = db.prepare(sql);
        let preparedParameter = {
            $user_id: req.params.user_id.toString()[req.params.user_id.length-1],
            $image_id: req.params.image_id.toString()[req.params.image_id.length-1]
        };
        stmt.run(preparedParameter, function(err) {
            if (err) {
                logger.error(err);
                res.status(401).json({message: "DB-Error occurred at inserting uploaded file"});
                return console.log(err.message);
            }

            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });

        logger.debug('Upload successfully inserted into DB');

        stmt.finalize();
        res.status(200).json({message: `File successfully uploaded`, details: 'Also stored in DB'});
    });
});


/**
 * Delete an image from users favorites. Only allowed to logged in users.
 * @param id: the Database-id of the image to be deleted
 *
 */
router.delete('/favorites:image_id/:user_id', checkAuth, (req, res) => {
    let db = getDb();
    let preparedParameter = {
        $image_id: req.params.image_id.toString()[req.params.image_id.length-1],
        $user_id: req.params.user_id.toString()[req.params.user_id.length-1]
    }

    const sql = 'delete from users_images where user_id=$user_id and image_id=$image_id;';


    db.serialize(function () {
        let stmt = db.prepare(sql);
        stmt.run(preparedParameter, function(err) {
            if (err) {
                logger.error(err);
                res.status(401).json({message: "DB-Error occurred at deleting file"});
                return console.log(err.message);
            }

            console.log(`A row has been deleted`);
        });

        logger.debug('Upload successfully inserted into DB');

        stmt.finalize();
        res.status(200).json({message: `File successfully deleted`, details: 'Also deleted from DB'});
    });
});

/**
 * Add an rating to an image
 *
 */

router.post('/rating:image_id/:rating_id',  checkAuth, (req, res) => {
    logger.debug('test received: ', req.body);
    let db = getDb();
    const sql = 'insert into images_ratings (image_id, rating_id) values ($image_id, $rating_id);';

    db.serialize(function () {
        let stmt = db.prepare(sql);
        let preparedParameter = {
            $image_id: req.params.image_id.toString()[req.params.image_id.length-1],
            $rating_id: req.params.rating_id.toString()[req.params.rating_id.length-1]
        };
        stmt.run(preparedParameter, function(err) {
            if (err) {
                logger.error(err);
                res.status(401).json({message: "DB-Error occurred at inserting uploaded file"});
                return console.log(err.message);
            }

            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });

        logger.debug('Upload successfully inserted into DB');

        stmt.finalize();
        res.status(200).json({message: `File successfully uploaded`, details: 'Also stored in DB'});
    });
});

/**
 * get all tags from a given image. the image id is sent as request-parameter
 * returns a json-array with the hashtags to the client
 */
router.get('/:id/t', (req, res) => {
    let db = getDb();
    let imageId = req.params.id;
    let sql = 'select t.name ' +
        'from tag t join images_tags it ' +
        'on t.id = it.tag_id ' +
        'where it.image_id = ?';

    db.serialize(function () {
        sql = db.prepare(sql);
        let tags = [];
        sql.each(imageId, function (error, row) {
            tags.push('#' + row.name);
        }, function (error, count) {
            sql.finalize();

            res.json(JSON.stringify(tags));
            res.status(200);
        });
    });
});

module.exports = router;
