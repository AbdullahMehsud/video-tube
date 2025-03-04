import mongoose, {isValidObjectId} from "mongoose";
import {like} from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Tweet } from "../models/tweet.models.js";


const toggleVideoLike = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user?._id

    if(!videoId){
        throw new ApiError(401, "Video not found")
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(videoId)){
            throw new ApiError(400, "Invalid video id format")
        }

        const video = await Video.findById(videoId)
        if(!video){
            throw new ApiError(402, "Video not found")
        }

        const existingLike = await like.findOne({video: videoId, likedBy: userId})

        if(existingLike){
            await like.findByIdAndDelete(existingLike._id)
            return res.status(200).json(new apiResponse(201, "Video unlike successfully"))
        } else {
            const newLike = await like.create({video: videoId, likedBy: userId})
            return res.status(200).json( new apiResponse(201, newLike, "Video liked successfully"))

        }
    } catch (error) {
        console.log("Error toggling like", error);
        throw new ApiError(500, "some thing went wrong while toggling video like")
        
    }
})

const toggleCommentLike = asyncHandler( async(req, res) => {
    const {commentId} = req.params
    // TODO: toggle like on comment
})

const toggletweetLike = asyncHandler( async(req, res) => {
    const {tweetId} = req.params
    // TODO: toggle like on tweet
    const userId = req.user?._id
    if(!tweetId){
        throw new ApiError(400, "tweet id required")
    }

    try {
        if(!mongoose.Types.ObjectId.isValid(tweetId)){
            throw new ApiError(401, "Invalid tweet id format")
        }
        const tweet = Tweet.findById(tweetId)
        if(!tweet){
            throw new ApiError(402, "tweet not found")
        }

        const existingLike = await like.findOne({tweets: tweetId, likedBy: userId})

        if(existingLike){
            await like.findByIdAndDelete(existingLike._id)
            return res.status(200).json(new apiResponse(201, "Tweet unliked successfully"))
        } else {
            const newLike = await like.create({tweets: tweetId, likedBy: userId})
            return res.status(200).json( new apiResponse(201, newLike, "Tweet liked successfully"))

        }

    } catch (error) {
        console.log("Error toggling like", error);
        throw new ApiError(500, "some thing went wrong while toggling tweet like")
    }


})

const getLikedVideos = asyncHandler( async(req, res) => {
    //TODO: get all liked videos
})


export {
    toggleVideoLike,
    toggleCommentLike,
    toggletweetLike,
    getLikedVideos
}