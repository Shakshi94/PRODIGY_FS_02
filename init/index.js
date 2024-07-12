const mongoose = require('mongoose');
const data = require('./data.js');
const Employee = require('../models/employee.js') ;

main().then(() => {
    console.log("conencted succesful to DB");
}).catch((err) => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/employeeManagmentSystem');
}



const initDB = async()=>{
    await Employee.deleteMany();
    await Employee.insertMany(data.data);
    console.log("data is intailized in DB");
}

// initDB();