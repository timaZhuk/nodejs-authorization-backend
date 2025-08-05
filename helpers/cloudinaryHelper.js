const cloudinary = require("../config/cloudinary.js");

//call upload helper and return url and public_id
const uploadToCloudinary = async (filePath) => {
  try {
    //upload image's object with property fields (request object)
    const result = await cloudinary.uploader.upload(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.log("Error while uploading to cloudinary", error);
    throw new Error("Error while uploading to cloudinary");
  }
};

//-----
module.exports = {
  uploadToCloudinary,
};
