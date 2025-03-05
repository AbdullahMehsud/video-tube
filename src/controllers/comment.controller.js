import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";
import mongoose from "mongoose";

const getVideoComment = asyncHandler (async(req, res) => {
    //TODO: Get all video comments
    const {videoId} = req.params
    const {page =1, limit= 10} = req.query
})

const addComment = asyncHandler( async( req, res) => {
    //TODO: add comment to the video
    const {content} = req.body
    const {videoId} = req.params
    const userId = req.user?._id
    if(content?.trim() === "") {
        throw new ApiError(401, "Content is required")
    }

    if(!videoId){
        throw new ApiError(402, "Invalid video id")
    }

    try {
        const userId = req.user?._id
        const comment = Comment.create({
            content,
            owner: userId,
            video: videoId
        })

        return res.status(200).json( new apiResponse( 201, "comment added successfully"))
    } catch (error) {
        console.log("error while commenting", error);
        throw new ApiError(500, "some thing went wrong while comminting")
    }
    
})

const updateComment = asyncHandler( async( req, res) => {
    //TODO: update comment
})

const deleteComment = asyncHandler( async( req, res ) => {
    //TODO: delete comment of the vidoe
})

export {
    getVideoComment,
    addComment,
    updateComment,
    deleteComment
}

