const express = require('express');
const { getBootcamp,getBootcamps,updateBootcamp,createBootcamp,deleteBootcamp,getBootcampsInRadius,bootcampPhotoUpload } = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('./../middlewares/advancedResults');

//Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

//Re-route into other resource crouter
router.use('/:bootcampId/courses',courseRouter);

router.route('/').get(advancedResults(Bootcamp,'courses'),getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(bootcampPhotoUpload);


module.exports= router;  