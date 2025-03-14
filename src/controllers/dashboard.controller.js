import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { SubscriptionModel } from "../models/subscription.models.js";
import { like } from "../models/like.models.js";


const getChannelStates = asyncHandler( async(req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channelId")
    }

    try {
        const totalVideos = await Video.countDocuments({channelId})
        
        const totalViews = await Video.aggregate([
            {$match: {channelId: new mongoose.Types.ObjectId(channelId)}},
            {$group: {_id: null, totalViews: {$sum: "$views"}}}
        ]);

        const totalLikes = await like.countDocuments({channelId})

        const totalSubscribers = await SubscriptionModel.countDocuments({channelId})

        const stats = {
            totalVideos,
            totalLikes,
            totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
            totalSubscribers
        }
        res.status(200).json( new apiResponse( 201, stats, "channel stats retrived successfully"))
    } catch (error) {
        console.log("error while retriving channel stats", error);
        throw new ApiError(500, "some thing went wrong whild retriving channel stats")
        
        
    }
})

const getChannelVideos = asyncHandler( async( req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStates,
    getChannelVideos
}