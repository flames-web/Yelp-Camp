const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchError = require('../utils/catchAsync');
const {isLoggedIn, isAuthor , validateCampground} = require('../middleware');
const { campgroundSchema } = require('../schemas');
const Campground = require('../models/campground');
const AppError = require('../utils/AppError');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });




router.route('/')
   .get(catchError(campgrounds.index))
   .post(isLoggedIn,upload.array('image'),validateCampground,catchError(campgrounds.createCampground))
   
router.get('/new',isLoggedIn , catchError(campgrounds.renderNewForm))


router.route('/:id')
   .get( catchError(campgrounds.showCampgrounds))
   .put( isLoggedIn,isAuthor,upload.array('image'),validateCampground, catchError(campgrounds.updateCampground))
   .delete(isLoggedIn, isAuthor, catchError(campgrounds.deleteCampgrounds))

router.get('/:id/edit',isLoggedIn,isAuthor, catchError (campgrounds.editCampgrounds))

module.exports = router;