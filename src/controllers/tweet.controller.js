import { asyncHandler } from "../utils/asyncHandler.js"
import { apiResponse} from "../utils/apiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import mongoose, {isValidObjectId} from "mongoose"

const createTweet = asyncHandler( async(req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(content?.trim() === ""){
        throw new ApiError(400, "Content field is required")
    }
    try {
        const userId = req.user._id

        const tweet = await Tweet.create({
            content,
            owner: userId
        })
        

        return res.status(201).json(new apiResponse(200, tweet, "Tweet posted succssfully"))
    } catch (error) {
        throw new ApiError(500, "Someting went wrong while posting a tweet")
    }
})

const getUserTweet = asyncHandler( async(req, res) => {
    //TODO: get user tweets
    const {username} = req.params
    if(!username){
        throw new ApiError(400, "Username is required")
    }    

    try {
        const user = await User.findOne({
            username: username?.toLowerCase()
        })
    
        if(!user){
            throw new ApiError(401, "User not found")
        }
        const tweets = await Tweet.find({
            owner: user._id
    
        }).populate("owner", "username fullname avatar").sort({createdAt: -1})
    
        if(!tweets){
            throw new ApiError(404, tweets, "No tweets found of this user")
        }
    
        return res.status(200).json(new apiResponse(201, tweets, "Tweets fetch successfully"))
    } catch (error) {
        console.log("error while fetching user tweets", error);
        throw new ApiError(500, "Someting went wrong while fetching user tweets")
        
    }
})

const updateTweet = asyncHandler( async(req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    if(!content?.trim()){
        throw new ApiError(401, "Content cannot be empty")
    }

    try {
        const tweet = await Tweet.findOneAndUpdate(
            { _id: tweetId, owner: req.user?._id },
            { $set: { content: content } },
            { new: true }
            )
            if(!tweet){
                throw new ApiError(402, "Tweet not found or not authorized to update")
            }
        return res.status(200).json(new apiResponse(201, tweet, "Tweet updated successfully"))
    } catch (error) {
        console.log("error while updating tweet",error);
        
        throw new ApiError(500, "Someting went wrong while updating tweet")
    }

     
})

const deleteTweet = asyncHandler( async(req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    const tweet = await Tweet.findOneAndDelete(
        {_id: tweetId, owner: req.user?._id},

    )
    if(!tweet){
        throw new ApiError(404, "Tweet not found or not authorized to delete")
    }

    return res.status(200)
           .json(new apiResponse(201, tweet, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet
}