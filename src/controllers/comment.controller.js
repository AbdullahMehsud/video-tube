import { ApiError } from "../utils/ApiError";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Comment } from "../models/comment.models";
import mongoose from "mongoose";

const getVideoComment = asyncHandler (async(req, res) => {
    //TODO: Get all video comments
    const {videoId} = req.params
    const {page =1, limit= 10} = req.query
})

const addComment = asyncHandler( async( req, res) => {
    //TODO: add comment to the video
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

