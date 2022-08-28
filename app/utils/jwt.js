const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.sign = (data) => {
    return jwt.sign(data,process.env.APP_SECRET, {
        expiresIn:"24h"
    })
}
exports.verify = (token) => {
    try {
        const payload = jwt.verify(token,process.env.APP_SECRET)
        return payload
    } catch (error) {
        return false
    }
}
exports.decode = (token)=>{
    return jwt.decode(token,process.env.APP_SECRET)
}