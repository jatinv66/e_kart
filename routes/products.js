const express =require('express');
const router =express.Router();

let Product=require('../models/product');

// add route
router.get('/add',function(req,res){
res.render('add_product',{
    title:'Add Product'
});
});

//add submit post route
router.post('/add',function(req,res){

    let query={product_name:req.body.pname}
    Product.find(query,function(err,prod){
        if(err){
          console.log(err);
          return;
        }
        if(prod.length){
          req.flash('success','product already exists');
              res.redirect('/products/add');
        }
        else{

        let product = new Product();
        product.product_name=req.body.pname;
        product.product_desc=req.body.pdesc;
    product.product_quantity=req.body.pquantity;
       product.product_price=req.body.pprice;
        
        product.save(function(err){
            if(err){
                console.log(err);
                return;
            }
            else{
                req.flash('success','Product Added');
                res.redirect('/admins/admin_index');
            }
        });
    

    }
    });

});

//update product
router.post('/edit/:id',function(req,res){
    let product={};
    product.product_name=req.body.pname;
    product.product_desc=req.body.pdesc;
    product.product_quantity=req.body.pquantity;
    product.product_price=req.body.pprice;
    
    let query={_id:req.params.id}
    
    Product.update(query,product,function(err){
        if(err){
            console.log(err);
            return;
        }
        else{
            req.flash('success','Product updated');
            res.redirect('/admins/admin_index');
        }
    });
    });

router.delete('/:id',function(req,res){
    let query= {_id:req.params.id}

    Product.remove(query,function(err){
        if(err)
        {
            console.log(err);
        }
        res.send('Success');
    });
});
//load edit form
router.get('/edit/:id',function(req,res){
    Product.findById(req.params.id,function(err,product){
        res.render('edit_product',{
            title:'Edit product',
            product:product
        });
    });
});

//INDEX - show all products
router.get("/search", function(req, res){
    var noMatch = null;
    if(req.query.query) {
        const regex = new RegExp(escapeRegex(req.query.query), 'gi');
        // Get all products from DB
        Product.find({product_name: regex}, function(err, products){
           if(err){
               console.log(err);
           } else {
            res.render("search_results",{products:products});
           }
        });
    }
    else{
        Product.find({}, function(err, products){
            if(err){
                console.log(err);
            } else {
             res.render("search_results",{products:products});
            }
         });
    }
});


//get single product
router.get('/:id',function(req,res){
    Product.findById(req.params.id,function(err,product){
        res.render('product',{
            product:product
        });
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports=router;