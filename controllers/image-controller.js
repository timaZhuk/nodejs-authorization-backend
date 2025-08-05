const Image = require("../models/Image.js");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper.js");
const cloudinary = require("../config/cloudinary.js");
const fs = require("fs");

// POST--UPLOAD upload Image controller
const uploadImage = async (req, res) => {
  try {
    //check if file is missing in req object
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required (Image file is missed)",
      });
    }

    //upload file to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    //store the image url and public id along with the uploaded user id in DB
    const newlyUploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
    });
    //save image data in DB
    await newlyUploadedImage.save();

    //delete the file from local storage ("/uploads")
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: newlyUploadedImage,
    });

    //-----------------------
  } catch (error) {
    console.log("Error in imageUplod: ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong in uploader cloudinary",
    });
  }
};

//-GET ALL---fetch all uploaded images
const fetchImagesController = async (req, res) => {
  try {
    //----SORTING PART-----
    //number of page in query page=3
    const page = parseInt(req.query.page) || 1;
    // ---- max number of images on each page==5
    const limit = parseInt(req.query.limit) || 3;
    // ---- skip images depending on the page  you are currentlly
    // (3 page - 1) * 5 img= 2*5 = 10 images shoul be skipped
    const skip = (page - 1) * limit;
    //sort by created date
    const sortBy = req.query.sortBy || "createdAt";
    //put images on page in ascending or descending
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    //count total number of images
    const totalImages = await Image.countDocuments();
    //total pages
    const totalPages = Math.ceil(totalImages / limit);
    //-------create sorting object
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    //--------------------------------
    // images get from DB (sorted-->skipped (part of them)--> return limit number)

    const images = await Image.find().sort(sortObj).skip(skip).limit(limit);
    if (images) {
      res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        data: images,
      });
    }
  } catch (error) {
    console.log("Erro in fetchImages controller: ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again!",
    });
  }
};

//----DELETE image from MongoDB and from Cloudinary
const deleteImageController = async (req, res) => {
  try {
    //get image id from request params
    const getCurrentIdOfImageToBeDeleted = req.params.id;
    //get id from jwt--> decode(jwt)-->paylod--> userId
    //only authenticated user
    const userId = req.userInfo.userId;

    //get image from DB
    const image = await Image.findById(getCurrentIdOfImageToBeDeleted);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    //check if this image is uploaded by the current user
    //and if it has permission to delete image
    if (image.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this image.",
      });
    }

    //delete this image from cloudinary repo at first
    await cloudinary.uploader.destroy(image.publicId);

    //delete this image from MongoDB
    await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
    //---------------------------------------------------
  } catch (error) {
    console.log("Erro in fetchImages controller: ", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again!",
    });
  }
};

module.exports = {
  uploadImage,
  fetchImagesController,
  deleteImageController,
};
