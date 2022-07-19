const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users')
const User =  require('../models/user');
const catchError = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { isLoggedIn } = require('../middleware');
const session = require('express-session');



router.route('/register')
     .get(users.renderRegister)
     .post(catchError(users.register))


router.route('/login')
      .get(users.renderLogin)
      .post(passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}),users.login)


router.get('/logout', users.logout )

module.exports = router;