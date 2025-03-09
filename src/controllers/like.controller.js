import mongoose, {isValidObjectId} from "mongoose";
import {like} from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Comment } from "../models/comment.models.js";
import { User } from "../models/user.models.js";


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
    // TODO: toggle like on comment
    const {commentId} = req.params
    const userId = req.user?._id
    if(!commentId) {
        throw new ApiError(400, "Comment not found")
    }

    try {
        if(!mongoose.Types.ObjectId.isValid(commentId)){
            throw new ApiError(400, "Invalid comment ID format")
        }

        const comment = Comment.findById(commentId)

        if(!comment) {
            throw new ApiError(402, "comment not found")
        }
        const existingLike = await like.findOne({comment: commentId, likedBy: userId})

        if(existingLike){
            await like.findByIdAndDelete(existingLike._id)
            return res.status(200).json(new apiResponse(201, "Comment unlike successfully"))
        } else {
            const newLike = await like.create({comment: commentId, likedBy: userId})
            return res.status(200).json( new apiResponse(201, newLike, "Comment liked successfully"))

        }
    } catch (error) {
        console.log("Error toggling like", error);
        throw new ApiError(500, "some thing went wrong while toggling comment like")
    }


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
    const {page = 1, limit = 10} = req.query
    //TODO: get all liked videos
    const userId = req.user?._id
    
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    try {
        const likedVideos = await like.aggregate([
            {
                $match: { likedBy: new mongoose.Types.ObjectId(userId) },
            },

            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVideos"
                }
            },

            {
                $unwind: "$likedVideos"
            },

            {
                $project: {
                    _id: 0,
                    videoId: "$likedVideos._id",
                    title: "$likedVideos.title",
                    description: "$likedVideos.description",
                    video:"$likedVideos.videoFile",
                    thumbnail: "$likedVideos.thumbnail",
                    createdAt: "$likedVideos.createdAt",
                }
            },

            {
                $skip: (page - 1) * limit
            },
            {
                $limit: parseInt(limit)
            }
        ])
        
        if(!likedVideos.length){
            return res.status(200).json( new apiResponse(201, [], "No liked videos"))
        }

        return res.status(200).json( new apiResponse(201, likedVideos, "Liked videos Fetched successfully"))
    } catch (error) {
        console.log("error while fetching liked videos");
        throw new ApiError(500, "something went wrong while fetching liked videos")
    }
})


export {
    toggleVideoLike,
    toggleCommentLike,
    toggletweetLike,
    getLikedVideos
}