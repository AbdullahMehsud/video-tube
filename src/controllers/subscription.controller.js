import mongoose, {isValidObjectId} from "mongoose";
import { User } from "../models/user.models.js";
import { SubscriptionModel } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler( async(req, res) => {
        const {channelId} = req.params
        const userId = req.user?._id

        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user id")
        }
        if(channelId === userId.toString()){
            throw new ApiError(401, "You cannot subscribe to your self")
        }

        try {
            const existingSubscription = await SubscriptionModel.findOne({
                subscriber: userId,
                channel: channelId 
            })
    
            if(existingSubscription){
                const subscibe = await SubscriptionModel.findByIdAndDelete(existingSubscription._id)
                return res.status(200).json(new apiResponse(201, subscibe, "Unsubscribed successfully"))
            } else{
                const newSubscription = await SubscriptionModel.create({
                    subscriber: userId,
                    channel: channelId
                })
                return res.status(200).json(new apiResponse(201, newSubscription, "Subscribed successfully"))
            }
        } catch (error) {
            console.log("error while subscribing", error);
            throw new ApiError(500, "some thing went wrong while subscribing")
            
        }
})

const getUserChannelSubscribers = asyncHandler( async(req, res) => {
        const {channelId} = req.params

        try {
            const subscribers = await SubscriptionModel.find({
                channel: channelId
            }).populate(
                "subscriber",
                "username fullname email avatar "
            )

            if(!subscribers.length){
                return res.status(200).json( new apiResponse(201, "No subscriber found"))
            }
            return res.status(200).json( new apiResponse(201, subscribers, "Subscriber found successfully"))
        } catch (error) {
            console.log("error while fetching subscriber", error);
            throw new ApiError(500, "Some thing went wrong while fetching subscribers")
        }
})

const getSubscribedChannels = asyncHandler( async(req, res) => {
        const {subsciberId} = req.params

        if(!isValidObjectId(subsciberId)){
            throw new ApiError(400, "Invalid subscriber id")
        }
        try {
            const subscribedChannel = await SubscriptionModel.find({
                subscriber: subsciberId
            }).populate(
                "channel",
                "username fullname email avatar"
            )

            if(!subscribedChannel.length){
                return res.status(200).json( new apiResponse(200, "no subscribed channel"))
            }
            return res.status(200).json( new apiResponse(200, subscribedChannel ,"Subscribed Channel fetched successfully"))
        } catch (error) {
            console.log("error while fetching subscribed channel");
            throw new ApiError(500, "Some thing went wrong while fetching subscribed channel")
            
        }
})


export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
}
