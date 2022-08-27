if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const AppError = require('./utils/AppError');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user')
const passwordResetRoutes = require('./routes/passwordReset');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const {isloggedIn} = require('./middleware');
const catchAsync = require('./utils/catchAsync');
const Campground = require('./models/campground')
const MongoStore  = require('connect-mongo');

const app = express();  
  
  const dbUrl =  process.env.DB_URL;
  // 'mongodb://localhost:27017/yelp-camp1'


mongoose.connect(dbUrl,{
    useNewUrlParser : true ,
    useUnifiedTopology : true
    });


const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open', () => {
  console.log('Database Opened');
})


app.engine('ejs',ejsMate);

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = 'olalekan247'
const store = MongoStore.create({
    mongoUrl:dbUrl,
    secret,
	touchAfter: 24 * 60 * 60,
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

app.use(session({
    store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() * 1000 * 60*60*24*7,
        maxAge: 1000 * 60*60*24*7,
        httpOnly: true,
    }
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(helmet());

app.use(helmet.crossOriginEmbedderPolicy({ policy: "credentialless" }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcz8fqwkr/", 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })),
app.use(flash());
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
});


app.get('/', (req,res) => {
    res.render('home')
})

app.get('/search',catchAsync( async(req,res)=> {
    const perPage = 8;
    const page = parseInt(req.query.page);
    const campgrounds = await Campground.find(
        {$or:[
            {location:{'$regex':req.query.search,$options: "i"}},
            {title:{'$regex':req.query.search,$options: "i"}},
            {description:{'$regex':req.query.search,$options: "i"}}
         ]}).sort('-createdAt').skip(perPage * page - perPage).limit(perPage);
    const count = await Campground.count().sort('-createdAt').skip(perPage * page - perPage).limit(perPage);     
         res.render('campgrounds/index',{campgrounds,pages: Math.ceil(count / perPage),home: "/campgrounds/?",current: page,});
}))



app.use("/passwordReset", passwordResetRoutes);
app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);



app.all('*', (req,res,next) => {
    const error = new AppError('Page Not Found',400);
    next(error);
})

app.use((err,req,res,next) => {
    const { status = 500 } =  AppError;
    if(!err.message) err.message = 'Oh something went wrong';
    res.status(status).render('error',{err});
})

const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Listening at port ${port}`);
})