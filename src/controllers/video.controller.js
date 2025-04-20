import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import {
  deleteFromCloudinary,
  deleteVideoFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js"
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc" } = req.query;

  const {username} = req.params
  if(!username){
    throw new ApiError(404, "Username is required")
  }

  const user = await User.findOne({username})
  if(!user){
    throw new ApiError("user not found")
  }
  const matchStage = {owner: user._id};

  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortType === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  try {
    const videos = await Video.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField:"_id",
          as:"userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "videos",
          localField: "owner",
          foreignField: "owner",
          as: "userAllVideos"
        }
      },
      {
        $sort: sortOptions
      },
      {
        $skip: skip
      },
      {
        $limit: Number(limit)
      },
      {
        $project: {
          title: 1,
          description: 1,
          views: 1,
          videoFile: 1,
          thumbnail: 1,
          duration: 1,
          "userDetails.username": 1,
          "userDetails.avatar": 1,
          createdAt: 1,
          videoPublicId:1

          // if want with every video user other video

          // "userAllVideos._id": 1,
          // "userAllVideos.title": 1,
          // "userAllVideos.thumbnail": 1,
          // "userAllVideos.videoFile": 1,
        }
      }
    ]);

    return res.status(200).json(new apiResponse(200, videos, "All videos fetched successfully"));
  } catch (error) {
    console.log("Something went wrong while fetching videos", error);
    res.status(500).json(new ApiError(500, "Something went wrong while fetching the videos"));
  }
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

  let videoPath;
  try {
    videoPath = await uploadOnCloudinary(videoLocalPath);
    console.log("video uploaded", videoPath);
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
    throw new ApiError(500, "Faild to upload thumbnail");
  }

  try {
    const userId = req.user._id;
    const username = req.user.username;
    console.log("userId",userId);
    console.log("username: ",username);

    const video = await Video.create({
      title,
      description,
      videoFile: videoPath.url,
      thumbnail: videoThumbnail.url,
      duration: videoPath.duration,
      videoPublicId: videoPath.public_id,
      thumbnailPublicId: videoThumbnail.public_id,
      owner: userId,
      ownerName: username,
    });
    
    return res
      .status(201)
      .json(new apiResponse(200, video, "Video uploaded succssfully"));
  } catch (error) {
    console.log("video uploading faild", error);
    if (videoPath) {
      await deleteVideoFromCloudinary(videoPath.public_id);
      console.log("video deleted succssfully");
      
    }
    if (videoThumbnail) {
      await deleteFromCloudinary(videoThumbnail.public_id);
      console.log("thumbnail deleted succssfully");
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
  console.log("ID: ", videoId);
  
  if (!videoId) {
    throw new ApiError(401, "Video id is required");
  }

  const { title, description } = req.body

  
  if ([title, description].some((fields) => fields?.trim() === "")) {
    throw new ApiError(
      401,
      "All fields are required"
    );
  }
 let videoData;
 if (req?.files?.videoFile){
  const videoLocalPath = req.files?.videoFile?.[0]?.path
  try {
    videoData = await uploadOnCloudinary(videoLocalPath)
    console.log("video updated", videoData);
    
  } catch (error) {
    console.log("Error uploading video", error);
    throw new ApiError(500, "faild to uplaod video")
  }
 }

  let videoThumbnail;
  if (req.files?.thumbnail) {
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    try {
      videoThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      console.log("thumbnail uploaded", videoThumbnail);
    } catch (error) {
      console.log("Error uploading thumbnail", error);
      throw new ApiError(500, "Faild to upload thumbnail");
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
    if (videoThumbnail?.url) {
      updateFields.thumbnail = videoThumbnail.url;
      updateFields.thumbnailPublicId = videoThumbnail.public_id
    }
    if(videoData?.url) {
      updateFields.videoFile = videoData.url
      updateFields.videoPublicId = videoData.public_id
    }

    if(videoData) {
      await deleteVideoFromCloudinary(videoData.public_id)
      console.log("video deleted from cloudinry", videoData.public_id);
      
    }
    if(videoThumbnail) {
      await deleteFromCloudinary(videoThumbnail.public_id)
      console.log("thumbnail deleted from cloudinry", videoThumbnail.public_id);
    }
    const updatedVideo = await Video.findOneAndUpdate(
      { _id: videoId, owner: req.user._id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedVideo) {
      throw new ApiError(404, "Video not found");
    }

    return res
      .status(201)
      .json(new apiResponse(200, updatedVideo, "Video updated successffully"));
  } catch (error) {
    console.log("error uploading video", error);
    throw new ApiError(500, "Some thing went wrong while updating video");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // TODO: delete video

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video) {
    await deleteVideoFromCloudinary(video.videoPublicId)
    console.log("Video deleted from Cloudinary");
    await deleteFromCloudinary(video.thumbnailPublicId);
    console.log("thumbnail deleted from Cloudinary");
  }

  return res
    .status(200)
    .json(new apiResponse(201, video, "video deleted succssfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  
  if (!videoId) {
    throw new ApiError(401, "Video id is required");
  }
  try {
    
    const video = await Video.findOne({ _id: videoId, owner: req.user?._id });
    console.log("recive video id: ", video);
    console.log("recive user id: ", req.user?._id);
    
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    const newStatus = !video.isPublished;
    const toggleStatus = await Video.findOneAndUpdate(
      { _id: videoId, owner: req.user?._id },
      { $set: { isPublished: newStatus } },
      { new: true }
    );

    if (!toggleStatus) {
      throw new ApiError(404, "Unable to toggle video status");
    }

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          toggleStatus,
          `video ${toggleStatus.isPublished ? "Published" : "Unpublished"} successfully`
        )
      );
  } catch (error) {
    console.log("Error toggling publish status:", error);
    throw new ApiError(500, "Failed to toggle publish status");
  }
});

const getAllUsersVideos = asyncHandler(async(req, res) => {
 try {
    const videos = await Video.find().populate("owner", "username avatar")
    console.log("here");
    
    if(!videos){
      throw new ApiError(400, "Videos not found")
    }
    res.status(200).json(new apiResponse(201, videos, "Videos fetched successfully"))
 } catch (error) {
  console.log("something went wrong while fetching videos");
  throw new ApiError(500, "something went wrong while fetching videos")
 }


})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllUsersVideos
};
