const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const {verifyIsNotAuthenticated} = require('../middleware/checkAuthorization');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// REGISTER
router.post("/register",verifyIsNotAuthenticated,(req, res, next) => {
  var regex = new RegExp("^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9]).{8,}$");
  if(req.body.isManager != null || req.body.isAdmin != null || req.body.shopManaged != null){
    res.status(403).json({
      message: 'You are not allowed to set isManager, isAdmin and shopManaged from this route.'
    });
  }else if (!regex.test(req.body.password)){
    res.status(403).json({
      message: 'The password must have at least one UpperCase letter, one special case letter, two digits and a minimum length of 8.'
    });
  }else if (req.body.password != req.body.confirmPassword){
    res.status(403).json({
      message: 'The password and confirmPassword must be identical and are both required.'
    });
  }
  else {
    User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
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

// LOGIN
router.post("/login",verifyIsNotAuthenticated,(req, res, next) =>{
    User
    .find({email: req.body.email})
    .exec()
    .then(user =>{
        if(user.length < 1){
            return res.status(401).json({
                message: "Auth failed"
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err,result)=>{
            if(err){
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            if(result){
                const token =jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id,
                    isAdmin: user[0].isAdmin,
                    isManager: user[0].isManager,
                    shopManaged : user[0].shopManaged
                },
                "4fb7f246-1e67-447e-a955-f6e1d0e05a6e",
                {
                    expiresIn: "4h"
                });

                return res.status(200).json({
                    message: "Auth successful",
                    user: user,
                    token : token
                });
            }
            return res.status(401).json({
                message: "Auth failed"
            });
        });

    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });

});

module.exports = router;
