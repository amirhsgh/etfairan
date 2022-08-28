const { 
    register, login,
    forgot_password, validateUser,
    VerifiedUserEmail, reset_password,change_password } = require('../services/auth.service');
const createError = require('http-errors');
const { validationUser, validationEmail, validatePassword, validateChangePassword } = require('../services/validator.service')

async function authenticateRegister(req, res, next) {
    
    try {
        const validator = await validationUser(req.body, res);
        if (validator.passes()) {
            const user = await register(req.body, res);
            res.status(200).json({
                data:user
            })
            try{
                const validate = await validateUser(req, res, next);
                console.log(validate);
                // res.status(200).json({
                //     status:true,
                //     validate
                // })
            }catch (err){
                next(err)
            }

        }else{
            return res.status(200).json(validator.errors)
        }
    } catch (err) {
        next(err)
    }
}

async function authenticateLogin(req, res, next) {
    
    try {
        const data = await login(req.body, res)
        res.status(200).json({
            status:true,
            data
        });
    } catch(err) {
        next(err)
    }
}


async function authenticateLoginGoogleApi(req, res, next) {
    try {
        res.status(201).json(req.user)
    }catch (err) {
        next(err)
    }
}


async function verifiedUser(req, res, next) {
    try {
        const validate_user = await VerifiedUserEmail(req.query, res);
        res.status(200).json({
            status:true,
            message:"You are verified Now"
        })
    }catch (err) {
        next(err)
    }
}

async function changePassword(req, res, next) {
    try {
        const validator = await validateChangePassword(req.body, res);
        
        if (validator.passes()) {
            const data = await change_password(req, res, next);
            return res.status(200).json({
                status:"success",
                message:"Your Password change successfully"
            })
        }else{
            return res.status(200).json(validator.errors)
        }
    }catch(err) {
        next(err)
    }
}

async function forgotPassword(req, res, next) {
    try {
        const validator = await validationEmail(req.body, res);
        if (validator.passes()) {
            const user = await forgot_password(req, res, next)
            res.status(200).json({
                status:true,
                message:"You will receive a reset email if user with that email exist"
            })
        }else{
            return res.status(200).json(validator.errors)
        }
    } catch (err) {
        next(err)
    }
}

async function resetPassword(req, res, next) {
    try {
        const validator = await validatePassword(req.body, res);
        if (validator.passes()) {
            const reset_pass = await reset_password(req, res, next);
        }else{
            return res.status(200).json(validator.errors)
        }
    }catch (err) {
        next(err);
    }
}

module.exports = {
    authenticateRegister,
    authenticateLogin,
    verifiedUser,
    forgotPassword,
    resetPassword,
    changePassword,
    authenticateLoginGoogleApi
}