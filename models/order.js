let mongoose =require('mongoose');


//articel schema
let orderSchema=mongoose.Schema({
    uid:{
        type:String,
        required:true
    },
    paddress:{
        type:String,
        required:true
    },
    mobileNumber:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    landmark:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    order:[{}]

});
let Order =module.exports =mongoose.model('Order',orderSchema);