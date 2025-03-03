import mongoose, {isValidObjectId} from "mongoose";
import like from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleVideoLike = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler( async(req, res) => {
    const {commentId} = req.params
    // TODO: toggle like on comment
})

const toggletweetLike = asyncHandler( async(req, res) => {
    const {tweetId} = req.params
    // TODO: toggle like on tweet
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