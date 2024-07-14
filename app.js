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
const methodOverride = require('method-override');

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
app.use(methodOverride('_method'));

app.get('/dashboard',wrapAsync(async (req,res)=>{
    const count = await Employee.countDocuments();
    res.render('./employeeDetails/dashboard.ejs',{ employeeCount: count });
}));

// manage employee 

app.get('/members',wrapAsync(async (req,res)=>{
    let employees = await Employee.find({});
    res.render('./employeeDetails/members.ejs',{employees});
}));

// show employee 
app.get('/members/:id',wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let member= await Employee.findById(id);
    res.render('./employeeDetails/showmember.ejs',{member})
    
}));

// create new employee
app.get('/newEmployee',(req,res)=>{
  res.render('./employeeDetails/newmember.ejs');
});

app.post('/newEmployee',wrapAsync(async(req,res)=>{
     const newEmployee = new Employee(req.body.employees);
     
     await newEmployee.save();
     res.redirect('/members');
}));

// edit employee

app.get('/members/:id/edit',wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const employee = await Employee.findById(id);
    res.render('./employeeDetails/edit.ejs',{employee});
}));

app.put('/members/:id',wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let employee = await Employee.findByIdAndUpdate(id,{...req.body.employees});
    await employee.save();
    res.redirect(`/members/${id}`);
}));

app.all('*',(req,res,next)=>{
  next(new ExpressError(404,'Page Not Found'));
})

app.use((err,req,res,next)=>{
  let {statusCode=500,message='something went wrong'} = err;
  res.status(statusCode).render('Error.ejs',{err});
})
app.listen(port,()=>{
    console.log(`server is listening at port ${port}`);
})