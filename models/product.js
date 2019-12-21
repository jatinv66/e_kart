let mongoose =require('mongoose');


//articel schema
let productSchema=mongoose.Schema({
    product_name:{
        type:String,
        required:true
    },
    product_desc:{
        type:String,
        required:true
    },
    product_quantity:{
        type:Number,
        required:true
    },
    product_price:{
        type:Number,
        required:true
    }
});
let Product =module.exports =mongoose.model('Product',productSchema);