let express = require('express')
let app = express()
require('dotenv').config()
let isauthenticate = 0;
const mongoose = require('mongoose');
let ejs = require('ejs')
app.use(express.urlencoded())
app.set('view engine', "ejs")
app.use('/static', express.static('static'))
let url = process.env.MONGOURL
app.get('/', (req, res) => {
    res.render('Mainpage')
})
app.get('/start', (req, res) => {
    res.render('start');
})
app.get('/login', (req, res) => {
    res.render('start')
})
app.get('/register', (req, res) => {
    res.render('start')
})
app.post('/register', (req, res) => {
    let registerConnection = mongoose.createConnection(url + "/UserData")
    const regSchema = new mongoose.Schema({
        Name: String,
        Password: String,
        Phone: String,
        Email: String
    });
    let name = req.body.givenName
    let email = req.body.givenEmail
    const regModel = registerConnection.model('Userdata', regSchema);
    regModel.find({ Email: req.body.givenEmail }, (err, result) => {
        if (Object.keys(result).length != 0) {
            res.render('userexists')
        }
        else {
            let data = new regModel({
                Name: req.body.givenName,
                Email: req.body.givenEmail,
                Password: req.body.givenPassword,
                Phone: req.body.givenPhone
            })
            isauthenticate = 1;
            data.save();
            let taskConnection = mongoose.createConnection(url+"/" + ((email).split("@"))[0])
            const taskSchema = new mongoose.Schema({
                task: String,
                status: String,
                id: Number,
                Time: String
              });
            const taskModel = taskConnection.model('tasks', taskSchema);
            taskModel.find({},(err,data)=>{
                res.render('index',{name:name, email:email,Data:data});
            })
        }
    })
})

app.post('/add', (req, res) => {
    let email=req.body.email;
    let name=req.body.name;
    let temp = new Date();
    let time=""
    time+=temp.getDate();
    time+="-"
    time+=temp.getMonth()+1;
    time+="-"
    time+=temp.getFullYear();
    time+="   ";
    time+=temp.getHours();
    time+=":"
    time+=temp.getMinutes();
    let taskConnection = mongoose.createConnection(url+"/" + ((email).split("@"))[0])
    const taskSchema = new mongoose.Schema({
        task: String,
        status: String,
        id: Number,
        Time: String
      });
    const taskModel = taskConnection.model('tasks', taskSchema);
    taskModel.find({},(err,result)=>{
        let len =Object.keys(result).length;
        let data=new taskModel(
            {
                task: req.body.task,
                status: "unchecked",
                id:len,
                Time: time
            }
        )
        data.save();
    })
        res.redirect(`/home?name=${name}&email=${email}`);
})

app.post('/update', (req, res) => {
    console.log(req.body)
    let taskConnection = mongoose.createConnection(url+"/" + ((req.body.email).split("@"))[0])
    const taskSchema = new mongoose.Schema({
        task: String,
        status: String,
        id: Number,
        Time: String
      });
    const taskModel = taskConnection.model('tasks', taskSchema);
    for (const key in req.body) {
        console.log(key)
        taskModel.updateOne({ id: Number(key) }, {status:'checked'}, function(err,update){
            if(err) 
            console.log(err)
            else
            console.log(update)
        });
    }
    res.redirect(`/home?name=${req.body.name}&email=${req.body.email}`)
})

app.get('/comp',(req,res)=>{
  console.log(req);
    let taskConnection = mongoose.createConnection(url+"/" + ((req.query.email).split("@"))[0])
    const taskSchema = new mongoose.Schema({
        task: String,
        status: String,
        id: Number,
        Time: String
      });
    const taskModel = taskConnection.model('tasks', taskSchema);
    taskModel.find({},(err,result)=>{
        res.render('completed',{ email:req.query.email, Data:result});
    })
})

app.get('/home',(req,res)=>{
    let taskConnection = mongoose.createConnection(url+"/" + ((req.query.email).split("@"))[0])
    const taskSchema = new mongoose.Schema({
        task: String,
        status: String,
        id: Number,
        Time: String
      });
    const taskModel = taskConnection.model('tasks', taskSchema);
    taskModel.find({},(err,result)=>{
        res.render('index',{name:req.query.name,email:req.query.email,Data:result});
    })
})

app.get('/signout',(req,res)=>{
    isauthenticate=0;
    res.redirect('/');
})
app.post('/login', (req, res) => {
    let name = req.body.givenName;
    let email = req.body.givenEmail;
    // console.log(req.body);
    let loginConnection = mongoose.createConnection(url+"/UserData")
    const loginSchema = new mongoose.Schema({
      Password: String,
      Email: String
    });
    const loginModel = loginConnection.model('Userdata', loginSchema);
    loginModel.find({ Email: req.body.givenEmail }, (err, result) => {
      if (Object.keys(result).length != 0) {
        if (req.body.givenPassword == result[0].Password) {
          isauthenticate = 1
        if (isauthenticate == 1) {
            let taskConnection = mongoose.createConnection(url+"/" + ((email).split("@"))[0])
            const taskSchema = new mongoose.Schema({
                task: String,
                status: String,
                id: Number,
                Time: String
              });
            const taskModel = taskConnection.model('tasks', taskSchema);
            taskModel.find({},(err,data)=>{
                res.render('index',{name:name, email:email,Data:data});
            })
        }
        else
          res.redirect('/login')
        }
        else {
          res.render('in')
        }
      }
      else {
        res.render('userdoesnotexists')
      }
    })
  })
  app.get('/forget', (req, res) => {
    res.render('forget')
  })
  app.post('/forget', (req, res) => {
    let forgetConnection = mongoose.createConnection(url+"/UserData")
    const forgetSchema = new mongoose.Schema({
      Phone: String,
      Email: String
    });
    // console.log(req.body);
    const forgetModel = forgetConnection.model('Userdata', forgetSchema);
    forgetModel.find({ Email: req.body.email, Phone: req.body.phone }, (err, result) => {
      if (Object.keys(result).length == 0) {
        res.send("Check your info again.")
      }
      else {
        res.render('reset')
      }
    })
  })
app.post('/reset', (req, res) => {
    let resetConnection = mongoose.createConnection(url+"/UserData")
    const resetSchema = new mongoose.Schema({
      Password: String,
      Email: String
    });
    // console.log(req.body);
    const resetModel = resetConnection.model('Userdata', resetSchema);
    resetModel.updateOne({ Email: req.body.email }, { Password: req.body.givenPassword }, (err, update) => {
      if (err) {
        res.send("Some error occured!!!")
      }
      else {
        res.redirect('/login')
      }
    })
  })
app.listen(process.env.PORT || 80, () => {
    console.log("Running")
});