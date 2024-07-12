require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;
const mongoose = require('mongoose');
const ejs = require('ejs')
const ejsMate = require('ejs-mate');

main()
    .then(console.log('database connection created successfully!'))
    .catch((err) => console.log(err));

async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/employeeManagmentSystem');
    
}

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine','ejs');


app.listen(port,()=>{
    console.log(`server is listening at port ${port}`);
})