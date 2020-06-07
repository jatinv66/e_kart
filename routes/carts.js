const express =require('express');
const router =express.Router();
let Product=require('../models/product');
const stripe = require('stripe')('sk_test_KkICpiPLyXzNnwWHwAGfDjwY00AUjIhF5C');
let Cart=require('../models/cart');

let Order=require('../models/order');


var calculatecartshit = async function(carts){
    let product_quantity_string="";
    let flag;
    console.log(carts);
  for(var i=0;i<carts.length;i++)
  {
      console.log('in loop 1st '+i);
        const product=await Product.findById(carts[i].productID);
          product_quantity_string=product_quantity_string+product.product_quantity+'/';
    
  }
  let p_q=product_quantity_string.split('/');
  console.log(p_q);
  for(var i=0;i<carts.length;i++)
  {
        console.log('in loop 2nd '+i);
      if(carts[i].cart_product_quantity<=p_q[i])
      {
          flag=1
      }
      else{
          flag=0;
          break;
      }
  }
  return flag;
}







router.post('/charge/:amount/:carts/:uid/:paddress/:mobileNumber/:state/:city/:landmark', async function(req,res,next){
const carts =await Cart.find({userID:req.params.uid});
const flag = await calculatecartshit(carts);
    const amount= req.params.amount;
    const params=req.params;
    console.log(flag);
    if(flag==1)
    {
        Cart.find({userID:req.params.uid},function(err,cart_product){
            if(err){
                console.log(err);
            }
            else{
                    let query={uid:req.params.uid};
                    for( var i=0;i<cart_product.length;i++)
                    {
                        Order.update(query,{
                                paddress:params.paddress,
                                mobileNumber:params.mobileNumber,
                                state:params.state,
                                city:params.city,
                                landmark:params.landmark,
                                status:"pending",
                                $addToSet:{
                                order:cart_product[i]
                            }
                        },{upsert:true},function(err)
                        {
                            if(err)
                            {
                                console.log(err);
                                return ;
                            }else
                            {
                    
                            }
                        })
                    }
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
                    Cart.remove({userID:req.params.uid},function(err)
                    {
                        if(err)
                        {
                            console.log(err);
                        }
                    })
                }  
        })

        stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken
        })
        .then(customer => stripe.charges.create({
            amount :amount,
            description : params.carts,
            currency : 'inr',
            customer:customer.id
            
        }))
        .then(charge =>res.render('success'));
    }else{
        res.render('fail');
    }
})






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





router.post('/addtocart/:pid/:name/:price/:desc/:quantity/:uid',function(req,res){
if(req.body.orderq>0 && req.body.orderq!=null)
{    
    if(parseInt(req.body.orderq)<=parseInt(req.params.quantity))
    {    
        let cart=new Cart();
        cart.userID=req.params.uid;
        cart.productID=req.params.pid;
        cart.cart_product_name=req.params.name;
        cart.cart_product_quantity=req.body.orderq;
        cart.cart_product_price=req.params.price;
        cart.cart_product_desc=req.params.desc;

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
    else
    {
        req.flash('error','Ordering quantity cant be greater than available units');
        res.redirect('/products/'+req.params.pid);
    }
}else{
    req.flash('error','Please enter a valid Ordering quantity');
    res.redirect('/products/'+req.params.pid);
}
       
        });

//Update cart Product
router.post('/update/:pid/:cpid/:name/:quantity/:price/:uid',function(req,res){
    Product.find({_id:req.params.pid},function(err,product){
        if(err){
            console.log(err);
        }
        if(parseInt(product[0].product_quantity)<parseInt(req.body.updateQuantity) || req.body.updateQuantity<=0 || req.body.updateQuantity==null)
        {
            
            req.flash('error','Ordering quantity cant be greater than available units/cant be null/cant be 0 or less than 0');
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
        let total=0;
        for(let i=0;i<carts.length;i++)
        {
            total=total+parseInt(carts[i].cart_product_quantity)*parseInt(carts[i].cart_product_price);
        }
        if(err){
            console.log(err);
        }
        else{
           res.render('cart',{
               title:'cart',
               carts:carts,
               total:total
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