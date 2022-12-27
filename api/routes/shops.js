const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Product = require("../models/product");
const Shop = require('../models/shop');

// GET ALL SHOPS
router.get('/', (req, res, next) =>{
    Shop
    .find()
    .populate({
        path: 'products',
        select: { '_id': 1,'name':1},
        populate: { path: 'categories',select: { '_id': 1,'name':1} }
    })
    .select('name _id')
    .exec()
    .then(docs =>{
        console.log(docs);
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

// CREATE A SHOP
router.post('/',(req, res, next) =>{
    const shop = new Shop({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name
    });
    shop
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Handling POST request for /shops',
            createdShop : {
                name : result.name,
                _id : result._id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

// GET SHOP BY ID
router.get('/:shopId', (req, res, next) =>{
    const id = req.params.shopId;
    Shop
    .findById(id)
    .populate({
        path: 'products',
        select: { '_id': 1,'name':1},
        populate: { path: 'categories',select: { '_id': 1,'name':1} }
    })
    .select('name _id')
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json(doc);
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
router.patch('/:shopId',(req, res, next) =>{
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    if ("products" in updateOps){
        res.status(401).json({
            message: "You are only allowed to update the name or the image (or both) of a shop from this route."
        });
    }else {

        Shop
        .findById({_id: req.params.shopId})
        .exec()
        .then(shop =>{
            if(shop.length <1){
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
router.delete('/:shopId',(req, res, next) =>{ 
   Shop
   .remove({_id: req.params.shopId})
   .exec()
   .then(result =>{
        if(result.deletedCount == 0){
            res.status(401).json({
                message: "The provided shopID doesn\'t match a shop in the DB."
            });
        }else {
            Product
            .find({shopId: req.params.shopId})
            .remove()
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
           });
        }
   })
   .catch(err =>{
        console.log(err);
        res.status(500).json({
            error : err
        });
   });
});


module.exports = router;