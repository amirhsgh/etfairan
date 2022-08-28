const express = require("express");
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');
const { authGoogle } = require('../middlewares/google_auth');

router.post('/register', authController.authenticateRegister)
router.post('/login', authController.authenticateLogin)
router.post('/login/google', [authGoogle], authController.authenticateLoginGoogleApi)
router.post('/forgotpassword', authController.forgotPassword)
router.post('/resetpassword', authController.resetPassword)

router.get('/validate_email', authController.verifiedUser)
router.post('/change_password', [auth], authController.changePassword)

module.exports = router

