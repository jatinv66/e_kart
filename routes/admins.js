const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

let Admin = require('../models/admin');
let Product=require('../models/product');


router.get('/login', function(req, res){
    res.render('admin_login');
  });

router.get('/admin_index', function(req, res){
  Product.find({},function(err,products){
    if(err){
        console.log(err);
    }
    else{
       res.render('admin_view',{
           title:'Products',
           products:products
           });
    }
   
});
});

router.post('/login',function(req,res,next){
    passport.authenticate('admin', {
        successRedirect:'/admins/admin_index',
        failureRedirect:'/admins/login',
        failureFlash: true
      })(req, res, next);
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/admins/login');
});
  module.exports =router;