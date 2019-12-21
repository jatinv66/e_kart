const express =require('express');
const router =express.Router();
let Product=require('../models/product');

let Cart=require('../models/cart');




router.get('/checkout/:uid',function(req,res){
Cart.find({userID:req.params.uid},function(err,products){
    let total=0;
    for(let i=0;i<products.length;i++)
    {
        total=total+parseInt(products[i].cart_product_quantity)*parseInt(products[i].cart_product_price);
    }
      res.render('checkout',{
                title:'Checkout',
                products:products,
                total:total
            });        
    });
    });

router.get('/checkout/confirm/:uid',function(req,res){
    Cart.find({userID:req.params.uid},function(err,cart_product){
        for(let i=0;i<cart_product.length;i++)
        {
            let query=cart_product[i].productID;
            Product.findById(query,function(err,product){
                let update_query={product_quantity:parseInt(product.product_quantity)-parseInt(cart_product[i].cart_product_quantity)};
                Product.update({_id:query},update_query,function(err){
                    if(err){
                        console.log(err);
                      return;
                      }
                })
            })
        }
        Cart.remove({userID:req.params.uid},function(err){
            if(err)
            {
                console.log(err);
            }
            res.send('Success');
        })
    })
})



router.post('/addtocart/:pid/:name/:price/:quantity/:uid',function(req,res){

    if(parseInt(req.body.orderq)<=parseInt(req.params.quantity))
{    
       let cart=new Cart();
       cart.userID=req.params.uid;
       cart.productID=req.params.pid;
       cart.cart_product_name=req.params.name;
       cart.cart_product_quantity=req.body.orderq;
       cart.cart_product_price=req.params.price;

       cart.save(function(err){
        if(err){
            console.log(err);
            return;
        }
        else{
            req.flash('success','Product Added');
            res.redirect('/');
        }
    });
}
else{
    req.flash('success','Ordering quantity cant be greater than available units');
    res.redirect('/products/'+req.params.pid);
}
       
        });

//Update cart Product
router.post('/update/:pid/:cpid/:name/:quantity/:price/:uid',function(req,res){
    Product.find({_id:req.params.pid},function(err,product){
        if(err){
            console.log(err);
        }
        if(parseInt(product[0].product_quantity)<parseInt(req.body.updateQuantity) || req.body.updateQuantity==0 || req.body.updateQuantity==null)
        {
            
            req.flash('success','Ordering quantity cant be greater than available units/cant be null/cant be 0');
                 res.redirect('/carts/'+req.params.cpid+'/'+req.params.pid);
        
        }
        else{
            
            let cartProduct={};
            cartProduct.cart_product_name=req.params.name;
            cartProduct.userID=req.params.uid;
            cartProduct.productID=req.params.pid;
           cartProduct.cart_product_quantity=req.body.updateQuantity;
              cartProduct.cart_product_price=req.params.price;
                      
             let query={_id:req.params.cpid}
                           
           Cart.update(query,cartProduct,function(err){
                   if(err){
                      console.log(err);
                    return;
                    }
                else{
               req.flash('success','Cart updated');
                 res.redirect('/carts/'+req.params.cpid+'/'+req.params.pid);
               }
           });
        }
    })

    });
        
router.get('/show/:uid',function(req,res){
    let id=req.params.uid;
    Cart.find({userID:id},function(err,carts){
        if(err){
            console.log(err);
        }
        else{
           res.render('cart',{
               title:'cart',
               carts:carts
               });
        }
       
    });
   
})


router.delete('/:id',function(req,res){
    let query= {_id:req.params.id}

    Cart.remove(query,function(err){
        if(err)
        {
            console.log(err);
        }
        res.send('Success');
    });
});


router.get('/:cpid/:pid',function(req,res){
    Cart.findById(req.params.cpid,function(err,cart_product){
        Product.findById(req.params.pid,function(err,product){
            res.render('cart_product',{
                cart_product:cart_product,
                product:product
            });
        })
       
    });
});

module.exports=router;