const createError = require('http-errors');
const jwt = require('../utils/jwt');

module.exports = (req, res, next) => {

    if (!('authorization' in req.headers)) {
        throw createError.Unauthorized("You are not authorized!");
    }
    
    const Token = jwt.verify(req.headers.authorization.split(" ")[1]);

    if (!Token) {
        throw createError.Unauthorized("You are not authorized!")
    }

    next();
    
}