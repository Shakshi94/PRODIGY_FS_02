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
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const  LocalStrategy = require('passport-local');
const Admin = require('./models/admin');
const {isLoggedIn,saveRedirectUrl,checkNotAuthenticated }= require('./middleware');

main()
    .then(console.log('database connection created successfully!'))
    .catch((err) => console.log(err));

async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/employeeManagmentSystem');
    
}

// session 
const sessionOptions = {
  secret:process.env.SECRETCODE,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly:true 
   }
}

app.engine('ejs',engine);
app.use(express.static('public'));
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}));
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.use((req, res, next) => {
    res.locals.message = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currAdmin = req.user;
    next();
});

// Dashboard
app.get('/dashboard',isLoggedIn,wrapAsync(async (req,res)=>{
    const employeeCount = await Employee.countDocuments();
    const adminCount = await Admin.countDocuments();
    const admins = await Admin.find({});
    // Aggregation to calculate the total salary
const totalSalaryAggregation = await Employee.aggregate([
        {
            $group: {
                _id: null,
                totalSalary: { $sum: { $toDouble: "$salary" } } // Convert salary to double
            }
        }
    ]);

    // Get the total salary from the aggregation result
    const totalSalary = totalSalaryAggregation.length > 0 ? totalSalaryAggregation[0].totalSalary : 0;
    res.render('./employeeDetails/dashboard.ejs',{ employeeCount, adminCount,totalSalary,admins });
}));


// manage employee 

app.get('/members',isLoggedIn,wrapAsync(async (req,res)=>{
    let employees = await Employee.find({});
    res.render('./employeeDetails/members.ejs',{employees});
}));

//

app.get('/profile',isLoggedIn,wrapAsync(async(req,res)=>{
     res.render('./admin/profile.ejs');       
}));

// show employee 
app.get('/members/:id',isLoggedIn,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let member= await Employee.findById(id);
    if(!member){
        req.flash('error','employee you are requesting does not exist!')
        return res.redirect('/dashboard');
    }
    res.render('./employeeDetails/showmember.ejs',{member})
    
}));

// create new employee
app.get('/newEmployee',isLoggedIn,(req,res)=>{
  res.render('./employeeDetails/newmember.ejs');
});

app.post('/newEmployee',isLoggedIn,wrapAsync(async(req,res)=>{
     const newEmployee = new Employee(req.body.employees);
     
     await newEmployee.save();
     req.flash('success','new employee is added!')
     res.redirect('/members');
}));

// edit employee

app.get('/members/:id/edit',isLoggedIn,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const employee = await Employee.findById(id);
    res.render('./employeeDetails/edit.ejs',{employee});
}));

app.put('/members/:id',isLoggedIn,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let employee = await Employee.findByIdAndUpdate(id,{...req.body.employees});
    await employee.save();
    req.flash('success','employee is updated!')
    res.redirect(`/members/${id}`);
}));

app.delete('/members/:id',isLoggedIn,wrapAsync(async (req,res)=>{
        let {id} = req.params;
        await Employee.findByIdAndDelete(id);
        req.flash('success','employee deleted!')
        res.redirect('/members');
}));

// signup 
app.get('/signup',checkNotAuthenticated, (req, res) => {
    res.render('./admin/signup.ejs');
});

app.post('/signup',checkNotAuthenticated,async (req, res, next) => {

    try{
    const { name, email,phone,address,username, password } = req.body; // Assuming the form fields are named correctly
    const newAdmin = new Admin({
        name: name,
        email: email,
        username: username,
        address:address,
        phone:phone,
    });

    const registeredAdmin = await Admin.register(newAdmin, password);
    
    req.login(registeredAdmin, (err) => {
        if (err) {
            return next(err);
        }
        req.flash('success','Welcome to Employee Managment System!');
        res.redirect('/dashboard');
    });

   }catch(e){
    req.flash('error',e.message);
    res.redirect('/signup');
   }
});


// // login in 

app.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('./admin/login.ejs');
});

app.post('/login',checkNotAuthenticated,saveRedirectUrl,passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),async (req,res)=>{
    req.flash('success','Welcome to Employee Managment System,you are login!');
    let redirectUrl = res.locals.redirectUrl || '/dashboard';
    res.redirect(redirectUrl);
})

app.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if(err){
           return next();
        }
        req.flash('success','you are logged out !')
        res.redirect('/login');
    })
})



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