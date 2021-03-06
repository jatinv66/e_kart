const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');
let Address = require('../models/order');
let Cart = require('../models/cart');
//address route
router.get('/address/:total/:carts/:uid',function(req,res){
  const params=req.params;
  const total=req.params.total;
  res.render('address',{
    total:total,
    carts:params.carts,
    uid:params.uid
  })
})

router.post('/address/:uid',function(req,res){
  const uid=req.params.uid;
  const address=req.body;
  Cart.find({userID:uid},function(err,carts){
    let total=0;
    for(let i=0;i<carts.length;i++)
    {
        total=total+parseInt(carts[i].cart_product_quantity)*parseInt(carts[i].cart_product_price);
    }
    if(err){
        console.log(err);
    }
    else{
       res.render('checkout',{
           title:'cart',
           products:carts,
           total:total,
           address:address,
           uid:uid

           });
    }
   
});
})




// Register Form
router.get('/register', function(req, res){
  res.render('register');
});

// Register Proccess
router.post('/register', function(req, res){
    let query={username:req.body.username};
    User.find(query,function(err,user){
      if(err){
        console.log(err);
        return;
      }
      if(user.length){
        console.log(user);
        req.flash('error','username/email already exists');
            res.redirect('/users/register');
      }
      else{
  
  
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
  
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password','password should be of atleast 8 characters').isLength({min:8});
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  
    let errors = req.validationErrors();
  
    if(errors){
      res.render('register', {
        errors:errors
      });
    } else {
      let newUser = new User({
        name:name,
        email:email,
        username:username,
        password:password
      });
  
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
          if(err){
            console.log(err);
          }
          newUser.password = hash;
          newUser.save(function(err){
            if(err){
              console.log(err);
              return;
            } else {
              req.flash('success','You are now registered and can log in');
              res.redirect('/users/login');
            }
          });
        });
      });
    }
  }
    });
});

// Login Form
router.get('/login', function(req, res){
  res.render('login');
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('user', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});


module.exports = router;
