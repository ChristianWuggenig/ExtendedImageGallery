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


router.patch('/:id', checkAuth, (req, res) => {
    let db = getDb();
    let id = req.params.id;
    let desc = req.body.description;
    let user_id = req.user_id;
    /*
    * EX05
    */
    db.query("UPDATE images i,users_images ui SET i.description='"+desc+"' where i.id="+id+" and ui.user_id="+user_id+" and ui.image_id="+id,function(err,result){
        if (err) { res.status(400).json({ status:400, message: "an error occured" });}
        if(result.affectedRows == 1){
            res.status(200).json({message: "successful description update!"});
        }
    });
});

/**
 * Store an image in the images table in the database.
 * @param filepath disklocation of the image
 * @param res response object, only set in case of error
 */
function storeUploadInDB(filepath, res) {
    let db = getDb();

    const sql = 'insert into image (url_big, url_small, description) values ($url_big, $url_small, "");';
    db.serialize(function () {
        let stmt = db.prepare(sql);
        // let resultUser = {};
        let preparedParameter = {
            $url_small: filepath.url_small,
            $url_big: filepath.url_big
        };

        stmt.run(preparedParameter, function(err) {
            if (err) {
                logger.error(error);
                res.status(401).json({message: "DB-Error occurred at inserting uploaded file"});
                return console.log(err.message);
            }

            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });

        logger.debug('Upload successfully inserted into DB');

        stmt.finalize();
    });
};

/**
 * Upload an image to the server. Resize them so all our images have same width.
 * HTTP POST has to be of type multipart form-data
 */
router.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    logger.debug('Image upload request for file: ', req.file.filename);

    let oldFilePath = `./public/img/uploaded/${req.file.filename}`;
    let newFilePathBig = `./public/img/${req.file.filename}_big`;
    let newFilePathSmall = `./public/img/${req.file.filename}_small`;
    let newUrlSmall = `img/${req.file.filename}_small`;
    let newUrlBig = `img/${req.file.filename}_big`;

    resizeimage(`./public/img/uploaded/${req.file.filename}`)
        .resize({width: 3000}) // our big images: width:3000, height:2000
        .toFile(newFilePathBig)
        .then(data => {
            logger.debug('Successfully resized upload to big image: ', data)
        })
        .catch(err => {
            logger.info('Error resizing upload to big image: ', err)
        });
    resizeimage(`./public/img/uploaded/${req.file.filename}`)
        .resize({width: 320}) // our small images: width:320, height:213
        .toFile(newFilePathSmall)
        .then(data => {
            logger.debug('Successfully resized upload to small image: ', data)
        })
        .catch(err => {
            logger.info('Error resizing upload to small image: ', err)
        });

    storeUploadInDB({url_big: newUrlBig, url_small: newUrlSmall}, res);
    res.status(200).json({message: `File ${req.file.filename} successfully uploaded`, details: 'Also stored in DB'});
});

/**
 * Delete an image from users favorites. Only allowed to logged in users.
 * @param id: the Database-id of the image to be deleted
 *
 */
router.delete('/image/delete/:id', checkAuth, (req, res) => {
    let db = getDb();

    let imageToDelete = req.params.id;

    const sql = 'delete from users_images where user_id=$user_id and image_id=$image_id;';

    db.serialize(function () {
        let stmt = db.prepare(sql);
        stmt.all({$user_id: req.user_id, $image_id: imageToDelete}, function (err, rows) {
            if (err) {
                logger.error(err);
                res.status(401).json({message: "DB-Error, file could not be deleted"});
                return console.log(err.message);
            }
            Logger.debug('Successfully deleted image from this users favorites');
        });

        stmt.finalize();
    });
});

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
