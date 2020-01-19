const express = require('express');
const router = express.Router();
const checkAuth = require('../check_auth');
const getDb = require("../db").getDb;
const log4js = require('log4js');
let logger = log4js.getLogger();
logger.level = 'debug'; // Levels: (ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF)
//const fs = require('fs');
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

router.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    logger.debug('Image upload request for file: ', req.file.filename);

    res.status(200).json({message: `Upload request of file ${req.file.filename} received on server!`});
    // TODO: store the uploaded image in DB + resize
});


module.exports = router;
