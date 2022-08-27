const express = require('express');
const router = express.Router({mergeParams:true});
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews');
const Review = require('../models/review');
const {  reviewSchema } = require('../schemas');
const catchError = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { isReviewAuthor,isLoggedIn,validateReview } = require('../middleware');



router.post('/', isLoggedIn, validateReview, catchError(reviews.createReview));

router.delete('/:reviewId', isLoggedIn,isReviewAuthor, catchError(reviews.deleteReview));


module.exports = router;