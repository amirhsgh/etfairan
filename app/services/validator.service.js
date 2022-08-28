const Validator = require('validatorjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function validationUser(data, res){
    
    
    const validator = new Validator({
        email:data.email,
        password:data.password,
        password_confirmation:data.password_confirmation
    },{
        email:"required|email",
        password:["required","min:8","max:32","string","regex:/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,32}$/","confirmed"],
        password_confirmation:"required|min:8|max:32|string"
    });
    return validator;
}

async function validationEmail(data, res) {
    const validator = new Validator({
        email:data.email
    },{
        email:"required|email"
    });
    return validator;
}

async function validatePassword(data, res) {
    const validator = new Validator({
        password:data.password,
        password_confirmation:data.password_confirmation
    },{
        password:["required","min:8","max:32","string","regex:/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,32}$/","confirmed"],
        password_confirmation:"required|min:8|max:32|string"
    });
    return validator;
}

async function validateChangePassword(data, res) {
    const validator = new Validator({
        new_password:data.new_password,
        new_password_confirmation:data.new_password_confirmation,
        password:data.password
    },{
        new_password:["required","min:8","max:32","string","regex:/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,32}$/","confirmed"],
        new_password_confirmation:"required|min:8|max:32|string",
        password:"required"
    });
    return validator;
}

module.exports = {
    validationUser,
    validationEmail,
    validatePassword,
    validateChangePassword
}
