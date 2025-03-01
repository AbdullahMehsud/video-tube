import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
//configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File Uploaded on cloudinary. File path" + response.url);
    // once the file is uploaded, we would like to delete it from our server
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Error on cloudinary ", error);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from cloudinary. Public id ", result);
  } catch (error) {
    console.log("Error deleting from cloudinary", error);
    return null;
  }
};

const deleteVideoFromCloudinary = async (publicId) => {
  try {
      const result =   await  cloudinary.uploader.destroy(publicId, { type: "upload", resource_type: "video" })
      console.log("video deleted", result);
      
  } catch (error) {
    console.log("error deleting video", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary };
