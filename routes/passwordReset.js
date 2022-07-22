const  User  = require("../models/user");
const Token = require("../models/token");
const  main = require("../utils/sendEmail");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/catchAsync')


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
        // const link = `${process.env.BASE_URL}/passwordReset/${user._id}/${token.token}`;
        // const   from = '"Fred Foo 👻" <rajiolalekanh247@gmail.com>', // sender address
        //       to = email, // list of receivers
        //       subject = "Hello ✔ Reset Password Link", // Subject line
        //          text = "Hello world?", // plain text body
        //         html = " <a href='link'>link</a>", // html body

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
          if(!user && !token){
            req.flash('error','invalid link or expired');
          } 
          const {password,email,confirmPassword} = req.body;
          
          User.findByUsername(email).then(function(sanitizedUser){
          if (sanitizedUser){
           sanitizedUser.setPassword(password, function(){
           sanitizedUser.save();
           req.flash('Success','password reset sucessfully')
          res.redirect('/campgrounds');
          });
          } else {
              req.flash('error','this user does not exist');
              res.redirect('/passwordReset');
          }
          
      })
    })
        
module.exports = router;    
