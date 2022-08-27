const reset = require('../controllers/passwordReset');
const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/catchAsync')

router.route('/')
  .get(catchAsync(reset.getReset))
  .post(catchAsync(reset.postReset))
   
router.route('/:id/:token')
  .get(catchAsync(reset.getToken))
  .post(catchAsync(reset.postToken) )    

module.exports = router;    