const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const {verifyTokenAndIsAdmin} = require('../middleware/checkAuthorization');

const Category = require('../models/category');


// Create category
router.post('/',verifyTokenAndIsAdmin,(req, res, next) =>{
    const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name
    });
    category
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Handling POST request for /categories',
            createdCategory : {
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

// GET ALL categories
router.get('/', (req, res, next) =>{
    Category
    .find()
    .select('name _id')
    .exec()
    .then(docs =>{
        const response = {
            count : docs.length,
            categories: docs
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

// GET category by id
router.get('/:categoryId', (req, res, next) =>{
    Category
    .find({_id: req.params.categoryId})
    .select('name _id')
    .exec()
    .then(result =>{
        if(result.length < 1){
            res.status(200).json({
                message: 'No category found for the provided id'
            });
        } else {
            res.status(200).json(result);
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

// DELETE category by id
router.delete('/:categoryId',verifyTokenAndIsAdmin,(req, res, next) =>{
    Category
    .find({_id: req.params.categoryId})
    .exec()
    .then(result =>{
        if(result.length >= 1){
            Category
            .remove({_id: req.params.categoryId})
            .exec()
            .then(
                res.status(200).json({
                message: 'Category DELETED'
                })
            )
            .catch(err => {
                console.log(err);
                res.status(500).json({error: err});
            });
        } else {
            res.status(200).json({
                message: 'No category found for the provided id'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

// UPDATE category by id
router.patch('/:categoryId',verifyTokenAndIsAdmin, (req, res, next) =>{
    Category
    .find({_id: req.params.categoryId})
    .exec()
    .then(result =>{
        if(result.length < 1){
            res.status(200).json({
                message: 'No category found for the provided id'
            });
        } else {
            Category
            .update({_id: req.params.categoryId},{name: req.body.name})
            .exec()
            .then(res.status(200).json({
                message: 'category UPDATED'
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
});






module.exports = router;