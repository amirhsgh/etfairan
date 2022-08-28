const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

require('dotenv').config();
const bycrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('../utils/jwt');
const createError = require('http-errors');
const { sendEmail } = require('../utils/sendemail');

async function register(data, res){
    const { email,password } = data;
    const hash_password = bycrypt.hashSync(password, 12);
    const verify_code = crypto.randomBytes(32).toString('hex');
    const verification_code = crypto
        .createHash('sha256')
        .update(verify_code)
        .digest('hex');

    const user_exist = await prisma.user.findUnique({
        where:{
            email:email
        }
    });
        
    if (!user_exist) {
        const user = await prisma.user.create({
            data : {
                email:email,
                password:hash_password,
                verification_code:verification_code
            }
        })
        data.accessToken = await jwt.sign(user)
        return data;
    }
    return createError.Conflict("This user with this username or emial Already exist.")
}

async function login(data, res){
    const { email, password } = data;
    const user = await prisma.user.findUnique({
        where : {
            email
        }
        
    },{verified:true});

    if (!user) {
        throw createError.NotFound("User not registered");
    }

    
    
    const checkPassword = bycrypt.compareSync(password, user.password)
    if (!checkPassword) throw createError.Unauthorized("Email address or password not valid")
    
    if (!user.verified) {
        throw createError.Unauthorized("You first verified your email.")
    }
    
    delete user.password
    const accessToken = await jwt.sign(user)
    return {...user, accessToken}
}

async function validateUser(data, res, next) {
    const { email } = data.body;

    const user = await prisma.user.findUnique({
        where:{
            email:email
        }
    },{
        email:true,
        verification_code:true
    });


    if (!user) {
        throw createError.NotFound("This User does not exist.");
    }
    
    // console.log(data);
    
    try{
        const host = data.header('host')
        const link = 'http://' + host + '/validate_email/email=' + user.email + '/verification_code=' + user.verification_code
        let sendEmailResponse
        await sendEmail(email, link)
            .then((result) => sendEmailResponse = 'Validation code sended. Check your email')
            .catch((error) => sendEmailResponse = 'Validation code didn\'t send')
        return sendEmailResponse
    }catch(err) {
        next(err)
    }

}

async function VerifiedUserEmail(data, res) {
    const user = await prisma.user.findUnique({
        where:{
            verification_code:data.validation_code
        }
    });

    if (!user) {
        throw createError.NotFound("You are not our user");
    }

    const update_user = await prisma.user.update({
        where:{
            verification_code:data.validation_code
        },
        data:{
            verified:true
        }
    });

    return update_user;

}


async function change_password(data, res, next) {
    const Token = data.header('authorization').split(" ")[1];

    const auth_data = await jwt.decode(Token);

    const user = await prisma.user.findUnique({
        where:{
            id:auth_data.id
        }
    })

    if (!user) {
        throw createError.NotFound("This user not exist.")
    }

    const check_last_password = bycrypt.compareSync(data.body.password, user.password);
    
    if (!check_last_password) {
        throw createError.BadRequest("Your password is wrong.")
    } 

    const checkPassword = bycrypt.compareSync(data.body.new_password, user.password);

    if (checkPassword) {
        throw createError.BadRequest("You cant have same password and last password")
    }
    
    const hash_password = bycrypt.hashSync(data.body.new_password, 12);

    where = {id:user.id}
    data = {
        email:user.email,
        password:hash_password,
        passwordResetToken:null,
        passwordResetAt:null
    }
    select = {
        email:true
    }
    const update_user = await prisma.user.update({ where, data, select})
    return update_user;
}

async function forgot_password(data, res, next) {
    const { email } = data.body;

    const user = await prisma.user.findUnique({
        where:{
            email:email
        }
    });
    
    if (!user) {
        return res.status(200).json({
            status:"success",
            message:"You will receive a reset email if user with that email exist"
        })
    }

    if (!user.verified) {
        return res.status(200).json({
            status:"failed",
            message:"Account not verified"
        })
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');


    const user_update = await prisma.user.update({
        where:{
            email:user.email
        },
        data:{
            passwordResetToken:passwordResetToken,
            passwordResetAt:new Date(Date.now() + 10 * 60 * 1000)
        }
    },
    {email:true}
    )


    try{
        const host = data.header('host')
        const link = 'http://' + host + '/resetpassword/resetToken=' + resetToken 
        let sendEmailResponse
        await sendEmail(user.email, link, true)
            .then((result) => sendEmailResponse = 'Validation code sended. Check your email')
            .catch((error) => sendEmailResponse = 'Validation code didn\'t send')
        return sendEmailResponse
    }catch(err) {
        await prisma.user.update({
            where:{
                email:user.email
            },
            data:{
                passwordResetToken:null,
                passwordResetAt:null
            }
        },
        {email:true}
        );
        next(err)
    }
}

async function reset_password(data, res, next) {
    const passwordResetToken = crypto
    .createHash('sha256')
    .update(data.query.resetToken)
    .digest('hex');
    
    const user = await prisma.user.findFirst({
        where:{
            passwordResetToken:passwordResetToken
        }
    });

    if (!user) {
        throw createError.Unauthorized("Invalid Token or token has expired");
    }
    const hash_password = bycrypt.hashSync(data.body.password, 12);
    
    where = {id:user.id}
    data = {
        email:user.email,
        password:hash_password,
        passwordResetToken:null,
        passwordResetAt:null
    }
    select = {
        email:true
    }
    await prisma.user.update({ where, data, select})
    

    return res.status(200).json({
        status:"success",
        message:"Password data updated successfully"
    })

}


module.exports = {
    register,
    login,
    forgot_password,
    validateUser,
    VerifiedUserEmail,
    reset_password,
    change_password
}