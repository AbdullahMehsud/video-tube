import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { SubscriptionModel } from "../models/subscription.models.js";
import { like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";


const getChannelStates = asyncHandler( async(req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channelId")
    }

    try {
        const objectIdChannelId = new mongoose.Types.ObjectId(channelId);

        const totalVideos = await Video.countDocuments({owner: objectIdChannelId})
        
        const totalViews = await Video.aggregate([
            {$match: {owner: objectIdChannelId}},
            {$group: {_id: null, totalViews: {$sum: "$views"}}}
        ]);
        
        const videos = await Video.find({ owner: objectIdChannelId }).select("_id");
        const videoIds = videos.map(video => video._id);

        const totalLikes = await like.countDocuments({video: {$in: videoIds}})
        
        const totalSubscribers = await SubscriptionModel.countDocuments({channel: objectIdChannelId})

        const stats = {
            totalVideos,
            totalLikes,
            totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
            totalSubscribers
        }
        return res.status(200).json( new apiResponse( 201, stats, "channel stats retrived successfully"))
    } catch (error) {
        console.log("error while retriving channel stats", error);
        throw new ApiError(500, "some thing went wrong whild retriving channel stats")
        
        
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    try {
        const objectIdChannelId = new mongoose.Types.ObjectId(channelId);

        // Fetch videos uploaded by the channel
        const videos = await Video.find({ owner: objectIdChannelId })
            .sort({ createdAt: -1 }) // Newest videos first
            .select("_id title thumbnail views createdAt");

        // Extract video IDs to get likes & comments count
        const videoIds = videos.map(video => video._id);

        // Get like counts for each video
        const likesCount = await like.aggregate([
            { $match: { video: { $in: videoIds } } },
            { $group: { _id: "$video", count: { $sum: 1 } } }
        ]);

        // Get comment counts for each video
        // const commentsCount = await Comment.aggregate([
        //     { $match: { video: { $in: videoIds } } },
        //     { $group: { _id: "$video", count: { $sum: 1 } } }
        // ]);

        // Convert aggregation results to a dictionary (videoId -> count)
        const likesMap = {};
        likesCount.forEach(like => {
            likesMap[like._id.toString()] = like.count;
        });

        // const commentsMap = {};
        // commentsCount.forEach(comment => {
        //     commentsMap[comment._id.toString()] = comment.count;
        // });

        // Attach like and comment counts to each video
        const videosWithStats = videos.map(video => ({
            ...video.toObject(),
            likes: likesMap[video._id.toString()] || 0,
            // comments: commentsMap[video._id.toString()] || 0
        }));

        return res.status(200).json(new apiResponse(200, videosWithStats, "Channel videos retrieved successfully"));
    } catch (error) {
        console.error("Error retrieving channel videos:", error);
        throw new ApiError(500, "Something went wrong while retrieving channel videos");
    }
});



export {
    getChannelStates,
    getChannelVideos
}