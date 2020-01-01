const express = require('express');
const router = express.Router();
const checkAuth = require('../check_auth');
const getDb = require("../db").getDb;

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


module.exports = router;
