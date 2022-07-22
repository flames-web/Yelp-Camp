const User =  require('../models/user');
const Token = require('../models/token')

module.exports.renderRegister =  (req,res) => {
    res.render('users/register')
}

module.exports.register =  async (req,res,next) => {
    try{
        const {username , password , email} = req.body;
        const user = await  new User({username, email});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser,err => {
            if(err) return next(err);
             req.flash('success', 'Welcome to yelp-camp');
             res.redirect('/campgrounds');
        });
      } catch (e){
       req.flash('error', e.message);
       res.redirect('/register');
    }  
}

module.exports.renderLogin = async (req,res) => {
   // const token = await Token.find({})
    res.render('users/login');
   // console.log(token)
}

module.exports.login = (req,res) => {
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    console.log(req.session.returnTo);
    res.redirect(redirectUrl);
}

module.exports.logout =  (req,res,next) => {
    req.logout(e => {
   if (e) return next(e)     
   req.flash('success', 'Goodbye')
   res.redirect('/campgrounds')
   });
}

