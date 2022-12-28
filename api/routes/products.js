const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Product = require('../models/product');
const Shop = require('../models/shop');


// Create product
router.post('/:shopId/',(req, res, next) =>{
        Shop
        .findById({_id: req.params.shopId})
        .exec()
        .then(shop =>{
            if(!shop){
                res.status(401).json({
                    message: "The provided shopID doesn\'t match a shop in the DB"
                });
            }else{
                const product = new Product({
                    _id: new mongoose.Types.ObjectId(),
                    shopId: req.params.shopId,
                    name: req.body.name,
                    price: req.body.price,
                    description: req.body.description,
                    categories: req.body.category
                });
            product
            .save()
            .then(result =>{
                console.log(result.categories);
                Shop
                .findByIdAndUpdate({_id: req.params.shopId},{$push : {products: result._id}})
                .exec()
                .then(resu =>{
                    res.status(201).json({
                        message: 'Handling POST request for /product',
                        createdProduct : {
                            name : result.name,
                            _id : result._id
                        }
                    });
                })
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

);

// GET all product of a shop
router.get('/:shopId/',(req, res, next) =>{
    if(req.query.categoryId == null){
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 9999999999999;
        Shop
        .findById({_id: req.params.shopId})
        .exec()
        .then(shop =>{
            if(!shop){
                res.status(401).json({
                    message: "The provided shopID doesn\'t match a shop in the DB."
                });
            }else{
                Product
                .find({shopId: req.params.shopId})
                .select('_id shopId name description categories')
                .skip(page * limit)
                .limit(limit)
                .exec()
                .then(products =>{
                    if(products.length <1){
                        res.status(401).json({
                            message: "No product found for this shop."
                        });
                    }else {
                        res.status(200).json(products);
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
    }else
    {    
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 9999999999999;
    const categoryId = req.query.categoryId;
    Shop
    .findById({_id: req.params.shopId})
    .exec()
    .then(shop =>{
        if(!shop){
            res.status(401).json({
                message: "The provided shopID doesn\'t match a shop in the DB."
            });
        }else{
            Product
            .find({shopId: req.params.shopId})
            .select('_id shopId name description categories')
            .where({categories: categoryId})
            .skip(page * limit)
            .limit(limit)
            .exec()
            .then(products =>{
                if(products.length <1){
                    res.status(401).json({
                        message: "No product found for this shop."
                    });
                }else {
                    res.status(200).json(products);
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
    });}
});

// GET a product from a shop 
router.get('/:shopId/:productId',(req, res, next) =>{
    Shop
    .findById({_id: req.params.shopId})
    .exec()
    .then(shop =>{
        if(!shop){
            res.status(401).json({
                message: "The provided shopID doesn\'t match a shop in the DB."
            });
        }else{
            Product
            .find({_id: req.params.productId})
            .select('_id shopId name description categories')
            .exec()
            .then(products =>{
                if(products.length < 1){
                    res.status(401).json({
                        message: "The provided productID doesn\'t match a product in this shop."
                    });
                }else {
                    res.status(200).json(products);
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
});

// DELETE a product from a shop 
router.delete('/:shopId/:productId',(req, res, next) =>{
    Shop
    .findById({_id: req.params.shopId})
    .exec()
    .then(shop =>{
        if(!shop){
            res.status(401).json({
                message: "The provided shopID doesn\'t match a shop in the DB."
            });
        }else{
            Product
            .find({_id: req.params.productId})
            .populate('categories')
            .exec()
            .then(product =>{
                if(product.length < 1){
                    res.status(401).json({
                        message: "The provided productID doesn\'t match a product in this shop."
                    });
                }else {
                    Product
                    .findByIdAndRemove({_id: req.params.productId})
                    .exec()
                    .then( resu=>{
                        Shop
                        .findByIdAndUpdate({_id: req.params.shopId},{$pull : {products: product._id}})
                        .exec()
                        .then(res.status(200).json(
                            {
                                message: "Product deleted"
                            })
                            )
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({error: err});
                        }); 
                    }                       
                    )
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
});

// UPDATE a product of a shop
router.patch('/:shopId/:productId',(req, res, next) =>{
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
        Shop
        .findById({_id: req.params.shopId})
        .exec()
        .then(shop =>{
            if(!shop){
                res.status(401).json({
                    message: "The provided shopID doesn\'t match a shop in the DB."
                });
            }else{
                Product
                .find({_id: req.params.productId})
                .exec()
                .then(product =>{
                    if(product.length < 1){
                        res.status(401).json({
                            message: "The provided productID doesn\'t match a product in this shop."
                        });
                    }else {
                        Product
                        .update({_id: req.params.productId}, { $set:updateOps})
                        .exec()
                        .then(result => {
                            console.log(result);
                            res.status(200).json(result);
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

);







module.exports = router;