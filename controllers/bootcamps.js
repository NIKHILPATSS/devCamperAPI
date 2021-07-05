const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require('./../middlewares/async');
const geocoder = require('./../utils/geocoder');
const advancedResults = require('../middlewares/advancedResults');

//@desc     Get all bootcamps
//@route    Get /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req,res,next) => {
        res
        .status(200)
        .json(res.advancedResults);
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
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        bootcamp.remove();

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

//@desc     Upload Photo for bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   Private
exports.bootcampPhotoUpload = asyncHandler(async (req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }
        if(!req.files){
                return next(new ErrorResponse(`Please upload a file`, 400));
        }
        const file = req.files.file;

        if(!file.mimetype.startsWith('image')){
                return next(new ErrorResponse(`Please upload a image file`, 400));
        }
        //Check filesize
        if(file.size > process.env.MAX_FILE_UPLOAD){
                return next(new ErrorResponse(`Please upload a image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
        }

        //Create custom fileName
        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err => {
                if(err){
                        console.log(err);
                        return next(new ErrorResponse(`Problem with file uplaod`, 500));
                }
                await Bootcamp.findByIdAndUpdate(req.params.id,{photo : file.name});
                res
                .status(200)
                .json({ success : true , data : file.name})
        });

});