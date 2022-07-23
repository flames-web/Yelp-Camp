const  User  = require("../models/user");
const Token = require("../models/token");
//const  main = require("../utils/sendEmail");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const nodemailer = require("nodemailer");
const {google} = require('googleapis');
router.get('/', (req,res) => {
    res.render('users/reset')
})

router.post("/", catchAsync(
    async (req, res) => {
        const {email} = req.body; 
        const user = await User.findOne({ email });
         if (!user){
           req.flash('error',"user with given email doesn't exist")}
           let token = await Token.findOne({ userId: user._id })
           if (!token) {
             token = await new Token({
              userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }
        const link = `${process.env.BASE_URL}/passwordReset/${user._id}/${token.token}`;
        console.log(link);

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
      subject: 'Password Reset',
      text: link,
      html: `<a href="${link}">${link}</a>`,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}
sendMail()
  .then((result) => console.log('Email sent...', result,))
  .catch((error) => console.log(error.message));
  req.flash('success','password reset link sent your account');
  res.redirect('/passwordReset');     
}
))

 router.get("/:id/:token", async (req,res) => {
       const {id} = req.params;
       const token = await Token.findOne({token : req.params.token});
       console.log(token)
       res.render('users/newPassword',{token});
})


router.post("/:id/:token", async (req, res) => {
          const {id} = req.params;
          const user = User.findById({id})
          const token = await Token.findOne({id,token : req.params.token})
          if(!user || !token){
            req.flash('error','invalid link or expired');  
          } 
          const {password,email,confirmPassword} = req.body;
          
          User.findByUsername(email).then(function(sanitizedUser){
          if (sanitizedUser){
           sanitizedUser.setPassword(password, function(){
           sanitizedUser.save();
           req.flash('Success','password reset sucessfully')
          res.redirect('/campgrounds');
          })
          } else {
              req.flash('error','this user does not exist');
              res.redirect('/passwordReset');
          }
          
      })
    })    
module.exports = router;    