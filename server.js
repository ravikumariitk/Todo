let express = require('express')
let md5=require('md5')
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://RaviKumar:Ravi%40123@cluster0.fjtakvv.mongodb.net/onlocalhost", { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("We are connected")
});
const kittySchema = new mongoose.Schema({
    task: String,
    status: String,
    id: Number,
    Time:String
});
let Kitten;
let ejs = require('ejs')
let app = express();
app.use(express.urlencoded())
app.set('view engine', "ejs")
app.use("/static",express.static('static'));
app.get('/home', (req, res) => {//edited area
    
    Kitten.find( {id: {$gte:0}},function (err, kittens) {
        if (err) 
        {
            res.render('access');
    }
    else
        res.render('index', { Data: kittens})
    })
})
app.get('/signout', (req, res) => {
    res.redirect('/')
})
app.get('/', (req, res) => {
    res.render('Mainpage')
})
app.post('/add', (req, res) => {
  
    let temp = new Date();
    let time=""
    time+=temp.getHours();
    time+=":"
    
    time+=temp.getMinutes();
    Kitten.find(function(err,result){
        if(err)
        return err;
        else{
             id=(Object.keys(result).length)-1
             const fluffy = new Kitten({ task: req.body.addNew, status: "unchecked", id: id, Time:time });
             if (req.body.addNew != '') {
                 fluffy.save(function (err) {
                     if (err) return console.error(err);
                     else {
         
                         res.redirect('/home')
                     }
                 });
             }
             else {
                 res.send('Sorry')
             }
        }
    })
  
})
app.get('/comp',(req,res)=>{
    Kitten.find( {id: {$gte:0}},function (err, kittens) {
        if (err) return console.error(err);
        res.render('completed', { Data: kittens})
    })

  
})
app.get('/use', (req, res) => {
    let temp = new Date();
    let tempdate = temp.getDay() + "/" + temp.getMonth() + "/" + temp.getFullYear();
    res.render('use', { Date: tempdate })
})
app.get('/login', (req, res) => {
   res.render('login')
})
app.post('/update', (req, res) => {
    console.log(req.body)
    for (const key in req.body) {
        console.log(key)
        Kitten.updateOne({ id: Number(key) }, {status:'checked'}, function(err,update){
            if(err) 
            console.log(err)
            else
            console.log(update)
        });
    }
    res.redirect('/home')
})
app.post('/compupdate', (req, res) => {

    console.log(req.body)
    for (const key in req.body) {
        console.log(key)
        Kitten.updateOne({ id: Number(key) }, {status:'unchecked'}, function(err,update){
            if(err) 
            console.log(err)
            else
            console.log(update)
        });
    }
    res.redirect('/comp')
})
app.get('/register',function(req,res){
    res.render('register')
})
app.post('/login',(req,res)=>{
    Kitten= mongoose.model(req.body.givenEmail,kittySchema)
    Kitten.find({id:-1},function(err,result){
   if(err)
   console.log(err)
   else{
     if(!(Object.keys(result).length))
     {   
        res.render('userdoesnotexists')
     }
     else{
       if(result[0].task===md5(req.body.givenPassword))
       {
         res.redirect("/home")
       }
       else{
        res.render('in')
       }
       }
   }
   
    })
    
})
app.get('/forget',(req,res)=>{
    res.render('forget')
})
app.post('/reset',(req,res)=>{
    Kitten= mongoose.model(req.body.givenEmail,kittySchema)
    Kitten.updateOne({id:-1},{task:md5(req.body.givenPassword)},(err,result)=>{
        if(err)
        {
            return err;

        }
        else{
            res.redirect('/login')
        }
    })
})
app.post('/forget',(req,res)=>{   
    Kitten= mongoose.model(req.body.givenEmail,kittySchema)
    Kitten.find({id:-1,Time:req.body.givenPhone},(err,result)=>{
        if(err)
        {
            return err;

        }
        else{
            
             if(Object.keys(result).length)
             {
                   res.render('reset')
             }
             else{
                res.send("<h1>Check Your Phone no. again!</h1>")
             }
        }
    })
})
app.post('/register', function(req,res){
   Kitten= mongoose.model(req.body.givenEmail,kittySchema)
   Kitten.find({id:-1},function(err,result){
  if(err)
  console.log(err)
  else{
    if(!(Object.keys(result).length))
    {   
        let Data= new Kitten({
            task: md5(req.body.givenPassword),
            status: "",
            id: -1,
            Time:req.body.givenPhone
           })
           Data.save(function(err,result){
            if(err)
            {
                res.redirect('/register')
            }
            else{
                res.redirect('/home')
            }
           })
    }
    else{
        res.render('userexists')
      }
  }
  
   })
   
})
app.listen(process.env.PORT||80);