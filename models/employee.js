const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    imageUrl:{
        type:String,
        required:true,
    },
    age:{
        type:String,
        required:true,
    },
    position:{
        type:String,
        required:true,
    },
    department:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
        min:10,
    },
    hireDate:{
        type:String,
        required:true,
    },
    salary:{
        type:String,
        required:true,
    }
});

const Employee = new mongoose.model('Employee',employeeSchema);

module.exports= Employee;