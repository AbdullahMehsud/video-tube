import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";
import mongoose from "mongoose";

const getVideoComment = asyncHandler (async(req, res) => {
    //TODO: Get all video comments
    const {videoId} = req.params
    const {page =1, limit= 10} = req.query

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    try {
        const comment = await Comment.find({ video: videoId})
        .populate("owner", "username avatar fullname")
        .sort({createdAt: -1})
        .skip((page - 1)*limit)
        .limit(parseInt(limit))

        return res.status(200).json(new apiResponse(201, comment, "All video comments fetched successfully"))
    } catch (error) {
        console.log("error while fetching video comments", error);
        throw new ApiError(500, "Some thing went wrong while fetching video comments")
        
    }
})

const addComment = asyncHandler( async( req, res) => {
    //TODO: add comment to the video
    const {content} = req.body
    const {videoId} = req.params
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

        return res.status(200).json( new apiResponse( 201, comment, "comment added successfully"))
    } catch (error) {
        console.log("error while commenting", error);
        throw new ApiError(500, "some thing went wrong while comminting")
    }
    
})

const updateComment = asyncHandler( async( req, res) => {
    //TODO: update comment
    const {commentId} = req.params
    const {content} = req.body
    
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "comment ID required")
    }

    if(!content?.trim() === ""){
        throw new ApiError(400, "content can't be empty")
    }

   try {
     const comment = await Comment.findOneAndUpdate(
        {_id: commentId, owner: req.user?._id},
        {$set: {content: content}},
        {new: true}
     )
     console.log("comment:" ,comment);
     
     if (!comment){
         throw new ApiError(404, "Comment not found")
     }
 
     return res.status(200).json( new apiResponse(201, comment, "Comment updated successfully"))
   } catch (error) {
    console.log("error while updating comment", error);
    throw new ApiError(500, "Some thing went wrong while updating comment")
   }
    
})

const deleteComment = asyncHandler( async( req, res ) => {
    //TODO: delete comment of the vidoe
    const {commentId} = req.params
    const comment = await Comment.findByIdAndDelete(
        {_id: commentId, owner: req.user?._id}
    )

    if(!comment){
        throw new ApiError(500, "Comment not Found")
    }

    return res.status(200).json( new apiResponse(201, comment, "Comment deleted successfully"))
})

export {
    getVideoComment,
    addComment,
    updateComment,
    deleteComment
}

