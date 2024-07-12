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
        type:Number,
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
        type:Number,
        required:true,
        min:10,
    },
    hireDate:{
        type:String,
        required:true,
    },
    salary:{
        type:Number,
        required:true,
    }
});

const Employee = new mongoose.model('Employee',employeeSchema);

module.exports= Employee;