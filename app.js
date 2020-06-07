const express = require('express');
const path= require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const expressValidator =require('express-validator');
const flash=require('connect-flash');
const session =require('express-session');
const passport =require('passport');
const config =require('./config/database');
const crypto=require('crypto');
const multer=require('multer');
const GridFsStorage=require('multer-gridfs-storage');
const Grid=require('gridfs-stream');
const methodOverride=require('method-override');

mongoose.connect(config.database);
let db=mongoose.connection;

//check conn
db.once('open',function(){
    console.log('Connected to mongodb');
})

//check for db error
db.on('error',function(err){
    console.log(err);
})


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////image upload////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//create mongo connection
const conn= mongoose.createConnection('mongodb+srv://jatin:jatin@cluster0-k8ykj.mongodb.net/test?retryWrites=true&w=majority');

//init gfs
let gfs;


conn.once('open', ()=> {
     gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('images');
  })


//create storage engine
const storage = new GridFsStorage({
    url: 'mongodb+srv://jatin:jatin@cluster0-k8ykj.mongodb.net/test?retryWrites=true&w=majority',
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = file.originalname;
          const fileInfo = {
            filename: filename,
            bucketName: 'images'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////image upload////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//init app
const app=express();


const port =process.env.PORT || 3000;

//bring in models
let Product=require('./models/product');

//load views
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//body parser 
app.use(bodyParser.urlencoded({ extended : false}))

app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//express-session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  }));

// express messages middleware
app.use(require('connect-flash')());
app.use(function(req,res,next){
    res.locals.messages = require('express-messages')(req,res);
    next();
});

//express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
  });
// app.get('/test',function(req,res,next){
//   console.log('1');
//   next();
// },function(req,res,next){
//   console.log('2');
//   next();
// },function(req,res,next){
//   console.log('3');
// })
  //home route
app.get('/',function(req,res){
  Product.find({},function(err,products){
      if(err){
          console.log(err);
      }
      else{
         res.render('index',{
             title:'Products',
             products:products
             });
      }
     
  });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/upload',function(req,res){
    gfs.files.find().toArray((err,files)=>{
        //check if files 
        if(!files || files.length==0){
           res.render('image_upload',{files:false});
        }else{
            files.map(file=>{
                if(file.contentType==='image/jpeg' || 
                    file.contentType==='image/png')
                {
                    file.isImage=true;
                }else{
                    file.isImage=false;
                }
            });
            res.render('image_upload',{files:files});
        }
    });
});
//@route POST /upload
//@desc Uploads file to Db
app.post('/upload',upload.single('file'),(req,res)=>{
  res.redirect('/upload');
});

//@route GET /image/:filename
//@desc Display image
app.get('/image/:filename',(req,res)=>{
  gfs.files.findOne({filename:req.params.filename},(err,file)=>{

      if(!file || file.length===0){
          return res.status(404).json({
              err: 'No files exist'
          });
      }
     //check if image
     if(file.contentType==='image/jpeg' || file.contentType=='img/png'){
         //read output to browser
         const readstream = gfs.createReadStream(file.filename);
          readstream.pipe(res);
     }
     else{
         res.status(404).json({
             err:'Not an image'
         });
     }
  })
});

//delete image
app.delete('/files/:id',(req,res)=>{
  gfs.remove({_id:req.params.id,root:'images'},(err,gridStore)=>{
      if(err){
          return res.status(404).json({err:err});

      }
      res.send("Success");
  })
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





});

let products=require('./routes/products');
let users=require('./routes/users');
let carts = require('./routes/carts');
let admins = require('./routes/admins');
app.use('/products',products)
app.use('/users',users);
app.use('/carts',carts);
app.use('/admins',admins);
//start server
app.listen(port,function(){
    console.log('server started on port 3000');
})