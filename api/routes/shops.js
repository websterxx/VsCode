const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const {verifyTokenAndIsAdminOrSameManager,verifyTokenAndAdminOrManager} = require('../middleware/checkAuthorization');

const Product = require("../models/product");
const Shop = require('../models/shop');
const user = require("../models/user");

// GET ALL SHOPS
router.get('/', (req, res, next) =>{
    if(req.query.afterDate == null && req.query.beforeDate == null){
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 9999999999999;
        const holiday = req.query.holiday || {$in: [false, true]};
        console.log(new Date(Date.now()));
        Shop
        .find()
        .select('managedBy name products creationDate openningHours isInHoliday _id')
        .populate({
            path: 'products',
            select: { '_id': 1},
            populate: { path: 'categories',select: { '_id': 0,'name': 1} }
        })
        .where({isInHoliday: holiday})
        .skip(page * limit)
        .limit(limit)
        .exec()
        .then(docs =>{
            if(docs.length > 0 ){
                res.status(200).json({
                    count: docs.length,
                    shops : docs
                });
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
    }
    else {
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 9999999999999;
        const holiday = req.query.holiday || {$in: [false, true]};
        const beforeDate = req.query.beforeDate || new Date("3000-12-30T00:00:00.000Z");
        const afterDate = req.query.afterDate || new Date("1000-12-30T00:00:00.000Z");  
        Shop
        .find()
        .select('managedBy name products creationDate openningHours isInHoliday _id')
        .populate({
            path: 'products',
            select: { '_id': 1},
            populate: { path: 'categories',select: { '_id': 1} }
        })
        .where({isInHoliday: holiday, creationDate :{$gte: afterDate, $lte: beforeDate}})
        .skip(page * limit)
        .limit(limit)
        .exec()
        .then(docs =>{
            if(docs.length > 0 ){
                res.status(200).json({
                    count: docs.length,
                    shops : docs
                });
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
    }
});

// CREATE A SHOP
    router.post('/',verifyTokenAndAdminOrManager,(req, res, next) =>{
    var openningHours = req.body.openningHours;
    var days = true;
    days = openningHours.map((obj)=>{
        if(obj.day != "Mon" || "Tue" || "Web" || "Thu" || "Fri" || "Sat" || "Sun" ){
            return false;
        }
        return true;
    });
    if(openningHours == null){
        res.status(403).json({message : 'Please provide the openningHours(days,periods) array.'});
    }
    else if(days.length != 7 || false in days){
        res.status(403).json({
            message : 'OpenningHours length must be exactly 7 and must represent the whole days of the week.'
        });
    }
    else {
        Shop
        .find({name: req.body.name})
        .exec()
        .then(shops =>{
            if(shops.length > 0){
                res.status(403).json({
                    message : 'There is alreay a shop with the same name.'
                })
            }else {
                user
                .findById({_id: req.body.managedBy })
                .exec()
                .then(currentUser =>{
                    if(currentUser == null){
                        res.status(403).json({message : 'The provided manager was not found.'});
                    }
                    else if(!currentUser.isManager){
                        res.status(403).json({message : 'The manager provided does not have the manager role.'});
                    }
                    else if(currentUser.shopManaged != null){
                        res.status(403).json({message : 'The manager provided is already a manager of another shop.'});
                    }
                    else {
                        const shop = new Shop({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            managedBy: req.body.managedBy,
                            isInHoliday: req.body.isInHoliday,
                            creationDate : req.body.creationDate,
                            openningHours: openningHours
                        });
                        shop
                        .save()
                        .then(result => {
                            user
                            .findByIdAndUpdate({_id: req.body.managedBy},{$set : {shopManaged: result._id}})
                            .exec()
                            .then(
                                res.status(201).json({
                                message: 'Handling POST request for /shops',
                                createdShop : {
                                    name : result.name,
                                    _id : result._id
                                }}
                            ))
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({error: err});
                            });
                        })
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
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
    }
});

// GET SHOP BY ID
router.get('/:shopId', (req, res, next) =>{
    const id = req.params.shopId;
    Shop
    .findById(id)
    .select('managedBy name shopManaged creationDate openningHours isInHoliday _id')
    .populate({
        path: 'products',
        select: { '_id': 1},
        populate: { path: 'categories',select: { '_id': 1} }
    })
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json({
                shop : doc
            });
        } else {
            res.status(404).json({message : 'No valid entry found the provided shop ID'});
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

// UPDATE A SHOP
router.patch('/:shopId',verifyTokenAndIsAdminOrSameManager,(req, res, next) =>{
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    if ("products" in updateOps || "managedBy" in updateOps){
        res.status(401).json({
            message: "You are only allowed to update the name of the shop or if the shop is on holiday (or both) from this route."
        });
    }else {

        Shop
        .findById({_id: req.params.shopId})
        .exec()
        .then(shop =>{
            if(shop == null){
                res.status(401).json({
                    message: "Please provided a valid shopId."
                });
            }else {
                Shop
                .update({_id: req.params.shopId}, { $set:updateOps})
                .exec()
                .then(
                     res.status(200).json({
                        message: "Shop UPDATED."
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

// DELETE A SHOP
router.delete('/:shopId',verifyTokenAndIsAdminOrSameManager,(req, res, next) =>{ 
   Shop
   .find({_id: req.params.shopId})
   .exec()
   .then(shop => {
     if(shop.length < 1){
        res.status(401).json({
            message: "The provided shopID doesn\'t match a shop in the DB."
        });
     }
     else{
        Shop
        .remove({_id: req.params.shopId})
        .exec()
        .then(
            Product
            .find({shopId: req.params.shopId})
            .remove()
            .exec()
            .then(
                user
                .findOneAndUpdate({shopManaged : req.params.shopId},{$set: {shopManaged: null} })
                .exec()
                .then(
                    res.status(200).json({
                    message: "Shop DELETED."
                })
                )
                .catch(err =>{
                    res.status(500).json({
                        error : err
                    });
            })
            )
            .catch(err =>{
                res.status(500).json({
                    error : err
                });
            }))
                
        }})
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error : err
        });
   });
});

// UPDATE A SHOP MANAGER
router.post('/:shopId/manager',verifyTokenAndIsAdminOrSameManager,(req, res, next) =>{
    if(req.body.previousManager == null || req.body.newManager == null){
        res.status(401).json({
            message: "Please provide a valid previousManager and newManager fields ."
        });
    }
    else {
    Shop
    .findById(req.params.shopId)
    .exec()
    .then(shop =>{
        console.log(shop);
        if(shop == null){
            res.status(401).json({
                message: "Please provided a valid shopId."
            });
        }
        else {
        user
        .findById({_id: req.body.previousManager})
        .exec()
        .then(previousUser =>{
            if (previousUser == null){
                res.status(403).json({
                    message: "Please provided a valid previousManger userId."
                });
            }else if(String(previousUser.shopManaged)!= String(shop._id)){
                res.status(403).json({
                    message: "The previousUser is not a manager of this shop."
                });
            }
            else {
            user
            .findById({_id: req.body.newManager})
            .exec()
            .then(newUser =>{
                if (newUser == null){
                    res.status(403).json({
                        message: "Please provided a valid newManager userId."
                    });
                }else if (!newUser.isManager){
                    res.status(403).json({
                        message: "New manager provided does not have the manager role."
                    });
                }
                else if (newUser.shopManaged != null){
                    res.status(403).json({
                        message: "New manager is already a manager of another shop."
                    });
                }
                else
                {Shop
                .update({_id: req.params.shopId},{$set : {managedBy: req.body.newManager}})
                .exec()
                .then(
                    user
                    .update({_id: req.body.previousManager},{$set : {shopManaged: null}})
                    .exec()
                    .then(
                        user
                        .update({_id: req.body.newManager},{$set : {shopManaged: req.params.shopId}})
                        .then(
                            res.status(200).json({
                                message: "Shop manager updated."
                            })
                        )
                        .catch(err =>{
                            console.log(err);
                            res.status(500).json({
                                error : err
                            });
                       })
                    )
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error : err
                        });
                   })
                )
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
               });}
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({
                    error : err
                });
           });
        }})
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error : err
            });
       });    
    }})
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
    }        
});


module.exports = router;