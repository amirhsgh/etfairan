const authRoute = require('./auth')

module.exports = (app) => {
    app.use('/api/v1/auth', authRoute)
}