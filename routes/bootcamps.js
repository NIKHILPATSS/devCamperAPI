const express = require('express');
const { getBootcamp,getBootcamps,updateBootcamp,createBootcamp,deleteBootcamp,getBootcampsInRadius,bootcampPhotoUpload } = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');

//Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

const advancedResults = require('./../middlewares/advancedResults');
const { protect,authorize } = require('./../middlewares/auth'); 

//Re-route into other resource crouter
router.use('/:bootcampId/courses',courseRouter);
router.use('/:bootcampId/reviews',reviewRouter);

router.route('/').get(advancedResults(Bootcamp,'courses'),getBootcamps).post(protect,authorize('publisher','admin'),createBootcamp);

router.route('/:id').get(getBootcamp).put(protect,authorize('publisher','admin'),updateBootcamp).delete(protect,authorize('publisher','admin'),deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(protect,authorize('publisher','admin'),bootcampPhotoUpload);


module.exports= router;  