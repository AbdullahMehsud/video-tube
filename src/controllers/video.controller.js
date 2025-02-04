import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  // TODO: get all videos based on query, sort, pagination
  
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if ([title, description].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is missing");
  }

  let video;
  try {
    video = await uploadOnCloudinary(videoLocalPath);
    console.log("video uploaded", video);
  } catch (error) {
    console.log("Error uploading video", error);
    throw new ApiError(500, "Faild to upload video");
  }
  let videoThumbnail;
  try {
    videoThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("thumbnail uploaded", videoThumbnail);
  } catch (error) {
    console.log("Error uploading thumbnail", error);
    throw new ApiError(500, "Fiild to upload thumbnail");
  }

  try {
    const userId = req.User._id;

    const video = await Video.create({
      title,
      description,
      videoFile: video.url,
      thumbnail: videoThumbnail.url,
      duration: video.duration,
      owner: userId,
    });

    return res
      .status(201)
      .json(new apiResponse(200, video, "Video uploaded succssfully"));
  } catch (error) {
    console.log("video uploading faild", error);
    if (video) {
      await deleteFromCloudinary(videoLocalPath);
    }
    if (videoThumbnail) {
      await deleteFromCloudinary(thumbnailLocalPath);
    }
    throw new ApiError(500, "Some thing went wrong while uploading video");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    return res
      .status(201)
      .json(new apiResponse(201, video, "Video fetched successfully"));
  } catch (error) {
    console.log("Faild to fetch video by id", error);

    throw new ApiError(500, "Faild to fetch video");
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // TODO: update video details like title, descrtiption, thumbnail
  if (!videoId) {
    throw new ApiError(401, "Video id is required");
  }
  const { title, description } = req.body;
  if (!title?.trim() && !description?.trim() && !req.files?.thumbnail) {
    throw new ApiError(
      401,
      "Atleast one field is required title, description or thumbnail"
    );
  }

  let videoThumbnail;
  if (req.files?.thumbnail) {
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    try {
      videoThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      console.log("thumbnail uploaded", videoThumbnail);
    } catch (error) {
      console.log("Error uploading thumbnail", error);
      throw new ApiError(500, "Fiild to upload thumbnail");
    }
  }

  try {
    const updateFields = {};
    if (title?.trim()) {
      updateFields.title = title;
    }
    if (description?.trim()) {
      updateFields.description = description;
    }
    if (videoThumbnail?.trim()) {
      updateFields.thumbnail = videoThumbnail.url;
    }
    const updatedVideo = await Video.findOneAndUpdate(
      { _id: videoId, owner: req.user._id },
      { $set: updateFields },
      { new: true }
    );

    if(!updateVideo){
        throw new ApiError(404, "Video not found")
    }

    return res.status(201).json(new apiResponse(200, updateVideo, "Video updated succesffully"))
  } catch (error) {
    console.log("error uploading video", error);
    throw new ApiError(500, "Some thing went wrong while updating video")
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // TODO: delete video
    const video = await Video.findOneAndDelete(
        {_id: videoId, owner: req.user?._id})
    
        if(!video) {
            throw new ApiError(404, "Video not found")
        }
    return res.status(201).json(new apiResponse(201, video, "video deleted succssfully"))
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if(!videoId){
    throw new ApiError(401, "Video id is required")
  }
  try {
    const video = Video.findOne({_id:videoId, owner: req.user?._id})
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    const toggleStatus = await Video.findOneAndUpdate(
      {_id: videoId, owner: req.user?._id},
      {$set:{isPublished: !Video.isPublished}},
      {new: true})
      if(!toggleStatus){
          throw new ApiError(404, "Unable to toggle video status")
      }
  
      return res.status(200).json(new apiResponse(200,toggleStatus, `video ${toggleStatus? "Published":"Unpublished"} successfully`))


  } catch (error) {
    console.log("Error toggling publish status:", error);
    throw new ApiError(500, "Failed to toggle publish status");
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
