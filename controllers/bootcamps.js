const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middlewares/async');
const geocoder = require('./../utils/geocoder');

//@desc     Get all bootcamps
//@route    Get /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req,res,next) => {
        let query;
        //copy req.query
        const reqQuery = {...req.query};
        //fields to exclude
        const removeFields = ['select','sort'];
        //Loop over removefields and remove them from query
        removeFields.forEach(param => delete reqQuery[param]);
        //create query string
        let queryStr = JSON.stringify(reqQuery);
        //create operators
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match => `$${match}`);
        //finding resource
        query = Bootcamp.find(JSON.parse(queryStr));

        //Select Fields
        if(req.query.select){
                const fields = req.query.select.split(',').join(' ');
                query =query.select(fields);
        }
        //Sort
        if(req.query.sort){
                const sortBy = req.query.sort.split(',').join(' ');
                query =query.sort(sortBy);
        }else{
                query =query.sort('-createdAt');
        }
        const bootcamp = await query;
        res
        .status(200)
        .json({success : true,count : bootcamp.length,data : bootcamp});
});


//@desc     Get single bootcamp
//@route    Get /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp =  asyncHandler(async (req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        res
        .status(200)
        .json({success : true,data : bootcamp});
});

//@desc     Create bootcamp
//@route    Post /api/v1/bootcamps/
//@access   Private
exports.createBootcamp =  asyncHandler(async(req,res,next) => {
        const bootcamp = await Bootcamp.create(req.body);

        res
        .status(201)
        .json({success : true,data : bootcamp});
});

//@desc     Update bootcamp
//@route    Put /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req,res,next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new : true,
            runValidators : true
        });

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        res
        .status(201)
        .json({success : true,data : bootcamp});
});


//@desc     Delete bootcamp
//@route    Delete /api/v1/bootcamps/
//@access   Private
exports.deleteBootcamp = asyncHandler(async (req,res,next) => {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        res
        .status(201)
        .json({success : true,data : {}});
});


//@desc     Get bootcamp within a radius
//@route    Get /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Private
exports.getBootcampsInRadius = asyncHandler(async (req,res,next) => {
        const { zipcode ,distance } = req.params;
        //get latitude and longitude from geocoder
        const loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;

        //Calc radius using radians
        //Divide distance by radius of earth    
        //Earth radius = 3,963 mi / 6378 km
        const radius = distance / 3963 ;

        const bootcamps = await Bootcamp.find({
                location : {$geoWithin:  {$centerSphere:[ [lng,lat],radius] } }
        });

        res
        .status(200)
        .json({success:true,count:bootcamps.length,data:bootcamps})
});