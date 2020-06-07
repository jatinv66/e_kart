let mongoose =require('mongoose');


//cart schema
let cartSchema=mongoose.Schema({
    userID:{
        type:String,
        required:true
    },
    productID:{
        type:String,
        required:true
    },
    cart_product_name:{
        type:String,
        required:true
    },
    cart_product_quantity:{
        type:Number,
        required:true
    },
    cart_product_price:{
        type:Number,
        required:true
    },
    cart_product_desc:{
        type:String,
        required:true
    }
});
let Cart =module.exports =mongoose.model('Cart',cartSchema);