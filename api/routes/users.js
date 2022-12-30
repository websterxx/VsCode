const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const {verifyTokenAndIsAdmin ,verifyTokenAndIsAdminOrSameUser} = require('../middleware/checkAuthorization');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Shop = require('../models/shop');

// DELETE USER
router.delete('/:userId',verifyTokenAndIsAdmin,(req, res, next) =>{
   User
   .remove({_id: req.params.userId})
   .exec()
   .then(result =>{
    console.log(result);
    if(result.deletedCount == 0){
        res.status(200).json({
            message : "No user found for the provided userID."
        });
    }else {
        res.status(200).json({
            message : "User deleted"
        });
    }
   })
   .catch(err => {
    console.log(err);
    res.status(500).json({error: err});
    });
});

// GET All USERS
router.get('/',verifyTokenAndIsAdmin,(req, res, next) =>{
    console.log(new Date().setHours(8,0));
    User
    .find()
    .select('userName email firstName lastName isAdmin isManager password shopManaged _id')
    .exec()
    .then(docs =>{
        const response = {
            count : docs.length,
            shops: docs
        };
        if(docs.length > 0 ){
            res.status(200).json(response);
        } else {
            res.status(200).json({
                message: 'No entries found'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

// GET user by id
router.get('/:userId',verifyTokenAndIsAdminOrSameUser ,(req, res, next) =>{
    User
    .find({_id: req.params.userId})
    .select('userName email password firstName isAdmin isManager lastName shopManaged _id')
    .exec()
    .then(user =>{
        console.log(user);
        if(user.length > 0 ){
            res.status(200).json(user);
        } else {
            res.status(200).json({
                message: 'No user found for the provided userID.'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

// UPDATE user(firstName,lastName) by id
router.patch('/:userId',verifyTokenAndIsAdminOrSameUser,(req, res, next) =>{
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    if ("password" in updateOps || "email" in updateOps || "shopManaged" in updateOps){
        res.status(401).json({
            message: "You are only allowed to update the firstName or the lastName (or both) of a user from this route."
        });
    }else {
    User
    .findById({_id: req.params.userId})
    .exec()
    .then(shop =>{
        if(shop.length <1){
            res.status(401).json({
                message: "Please provided a valid userId."
            });
        }else {
            User
            .update({_id: req.params.userId}, { $set:updateOps})
            .exec()
            .then(
                res.status(200).json({
                message: "user UPDATED."
                })
            )
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error : err
                });
            });
        }
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
}
});

// UPDATE user(password) by id
router.patch('/password/:userId',verifyTokenAndIsAdminOrSameUser,(req, res, next) =>{
    if("password" in req.body){
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err
              });
            } else {
              User
                .findByIdAndUpdate({_id: req.params.userId},{$set:{password: hash}})
                .then(result => {
                    if(!result){
                        res.status(401).json({
                            message: "Please provided a valid userId."
                          });
                    }else{
                        res.status(201).json({
                            message: "User password updated."
                          });
                    }

                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    error: err
                  });
                });
            }
          });
    }else {
        res.status(401).json({
            message: 'Please provide a password field'
        });
    }
}
);

// Make user an admin
router.post('/admin/:userId',verifyTokenAndIsAdmin,(req, res, next) =>{
    User
    .find({_id: req.params.userId})
    .exec()
    .then(user =>{
        if(user.length < 1 ){
            res.status(401).json({
                message: 'User not found.'
            });
        } else if(user[0].isAdmin) {
            res.status(401).json({
                message: 'User already an admin.'
            });
        }else {
            User
            .update({_id: req.params.userId},{$set:{isAdmin: true}})
            .exec()
            .then(res.status(200).json(
                {
                    message: 'User is now an admin.'
                
                }))
            .catch(err => {
                console.log(err);
                res.status(500).json({error: err});
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
}
);

// Remove user admin role
router.post('/admin/remove/:userId',verifyTokenAndIsAdmin,(req, res, next) =>{
    User
    .find({_id: req.params.userId})
    .exec()
    .then(user =>{
        if(user.length < 1 ){
            res.status(401).json({
                message: 'User not found.'
            });
        } else if(!user[0].isAdmin) {
            res.status(401).json({
                message: 'User is already not an admin.'
            });
        }else {
            User
            .update({_id: req.params.userId},{$set:{isAdmin: false}})
            .exec()
            .then(res.status(200).json(
                {
                    message: 'User admin role removed.'
                
                }))
            .catch(err => {
                console.log(err);
                res.status(500).json({error: err});
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
}
);

// Make user a manager
router.post('/manager/:userId',verifyTokenAndIsAdmin,(req, res, next) =>{
    User
    .find({_id: req.params.userId})
    .exec()
    .then(user =>{
        if(user.length < 1 ){
            res.status(401).json({
                message: 'User not found.'
            });
        } else if(user[0].isManager) {
            res.status(401).json({
                message: 'User already a manager.'
            });
        }else {
            User
            .update({_id: req.params.userId},{$set:{isManager: true}})
            .exec()
            .then(res.status(200).json(
                {
                    message: 'User is now a manager.'
                
                }))
            .catch(err => {
                console.log(err);
                res.status(500).json({error: err});
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
}
);

// Remove user manager role
router.post('/manager/remove/:userId',verifyTokenAndIsAdmin,(req, res, next) =>{
    User
    .find({_id: req.params.userId})
    .exec()
    .then(user =>{
        if(user.length < 1 ){
            res.status(401).json({
                message: 'User not found.'
            });
        } else if(!user[0].isManager) {
            res.status(401).json({
                message: 'User is already not a manager.'
            });
        }else {
            User
            .update({_id: req.params.userId},{$set:{isManager: false}})
            .exec()
            .then(res.status(200).json(
                {
                    message: 'User manager role removed.'
                
                }))
            .catch(err => {
                console.log(err);
                res.status(500).json({error: err});
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
}
);


module.exports = router;