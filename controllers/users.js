const User =  require('../models/user');
const Token = require('../models/token');
const nodemailer = require('nodemailer');
const {google} = require('googleapis')

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
            const CLIENT_ID = process.env.CLIENT_ID;
            const CLEINT_SECRET = process.env.CLEINT_SECRET;
            const REDIRECT_URI = process.env.REDIRECT_URI;
            const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
         const oAuth2Client = new google.auth.OAuth2(
           CLIENT_ID,
           CLEINT_SECRET,
           REDIRECT_URI
         );
         oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
         
         async function sendMail() {
           try {
             const accessToken = await oAuth2Client.getAccessToken();
         
             const transport = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                 type: 'OAuth2',
                 user: 'rajiolalekanh247@gmail.com',
                 clientId: CLIENT_ID,
                 clientSecret: CLEINT_SECRET,
                 refreshToken: REFRESH_TOKEN,
                 accessToken: accessToken,
               },
             });
         
             const mailOptions = {
               from: 'Yelp Camp <yours authorised email rajiolalekanh247@gmail.com>',
               to: email,
               subject: 'Welcome to Yelp Camp',
               text:'Jump right in and explore our many campgrounds. Feel free to share some of your own and comment on others',
               html:'<h1>Jump right in and explore our many campgrounds. Feel free to share some of your own and comment on others</h1>',
             }
             const result = await transport.sendMail(mailOptions);
             return result;
           } catch (error) {
             return error;
           }
         }
         sendMail()
           .then((result) => console.log('Email sent...', result,))
           .catch((error) => console.log(error.message));
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

