require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;
const mongoose = require('mongoose');
const ejs = require('ejs')
const engine = require('ejs-mate');
const path = require('path');
const Employee = require('./models/employee')
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');

main()
    .then(console.log('database connection created successfully!'))
    .catch((err) => console.log(err));

async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/employeeManagmentSystem');
    
}

app.engine('ejs',engine)
;
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/dashboard',async (req,res)=>{
 try {
    const count = await Employee.countDocuments();
    res.render('./employeeDetails/dashboard.ejs',{ employeeCount: count });
  } catch (error) {
    console.error('Error counting documents:', error);
    res.status(500).send('Internal Server Error');
  }
    
});

// manage employee 

app.get('/members',async (req,res)=>{
    let employees = await Employee.find({});
    res.render('./employeeDetails/members.ejs',{employees});
});

// show employee 
app.get('/members/:id',async (req,res)=>{
    let {id} = req.params;
    let member= await Employee.findById(id);
    res.render('./employeeDetails/showmember.ejs',{member})
    
});

// create new listing 
app.get('/newEmployee',(req,res)=>{
  res.render('./employeeDetails/newmember.ejs');
});

app.all('*',(req,res,next)=>{
  next(new ExpressError(404,'Page Not Found'));
})

app.use((err,req,res,next)=>{
  let {statusCode=500,message='something went wrong'} = err;
  res.status(statusCode).send(message);
})
app.listen(port,()=>{
    console.log(`server is listening at port ${port}`);
})