import  {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
const generateAccessAndRefreshToken = async (userId) => {
   try {
     const user = await User.findById(userId)
     
     const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()
 
     user.refreshToken = refreshToken
     await user.save({validateBeforeSave: false})
     return {accessToken, refreshToken}
   } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
        
   }
}

const registerUser = asyncHandler( async(req, res) => {
    const {fullname, email, username, password} = req.body
    
        //validation
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path || null // todo
    const coverLocalPath = req.files?.coverImage?.[0]?.path || null // todo

    // todo
    // if(!avatarLocalPath){
    //     throw new ApiError(400, "Avatar file is missing")
    // }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // let coverImage = ""
    // if(coverLocalPath){
    //    coverImage = await uploadOnCloudinary(coverLocalPath)
    // }
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Avatar uploaded", avatar);
    } catch (error) {
        console.log("Error uploading avatar", error);
        throw new ApiError(500, "Failed to upload avatar");
    }
    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath)
        console.log("coverImage uploaded", coverImage);
    } catch (error) {
        console.log("Error uploading cover coverImage", error);
        throw new ApiError(500, "Failed to upload coverImage");
    }

    try {
        const user = await User.create({
            fullname,
            avatar: avatar?.url || "", //todo
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
    
        const createUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if(!createUser) {
            throw new ApiError(500, "Something went wrong while registering a user")
        }
        return res.status(201).json(new apiResponse(200, createUser,"User registerd successfully"))
    } catch (error) {
        console.log("User creation failed");
        if(avatar){
            await deleteFromCloudinary(avatar.public_id)
        }
        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ApiError(500, "Something went wrong while registering a user and images were deleted")
    }
})

const loginUser = asyncHandler( async(req, res) => {
    // get data from body
    const {identifier, password} = req.body // identifier = email or username

    if(!identifier || !password) {
            throw new ApiError(500, "username or email and password is required")
    }

    const user = await User.findOne({
        $or: [{username: identifier}, {email: identifier}]
    })

    if(!user){
        throw new ApiError(404, "User not found")
    }

    // validate password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    if(!loggedInUser){
        throw new ApiError(403, "User in not logged in")
    }

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV = "production",
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json( new apiResponse(
            200, 
            { user: loggedInUser, accessToken, refreshToken },
            "User logged in successfully"
        ))
})

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {new: true}
    )
    
    const options = {
        httpOnly: true, 
        secure: process.env.NODE_ENV = "production",
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json( new apiResponse(200, {}, "User Logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)

        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid refresh token")
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {accessToken, 
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed successfully"
                ))
    } catch (error) {
        throw new ApiError(500, "Someting went wrong while refreshing access token")
    }
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const {oldPassword, newPassword} = req.body
    
    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect")
    }

    user.password = newPassword

    await user.save({validateBeforeSave: false})

    return res.status(200).json(new apiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res.status(200).json(new apiResponse(200, req.user, "Current user details"))
})

const updateAccountDetails = asyncHandler( async( req, res) => {
    const {username, email, fullname} = req.body

    if(!fullname || !email || !username) {
        throw new ApiError(400, "Fullname, email and username are required")
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                username: username,
                fullname: fullname,
                email: email,
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res.status(200).json(new apiResponse( 200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "File is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    res.status(200).json(new apiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler( async(req, res) => {
    const coverImageLocalPath =  req.file?.path

    if (!coverImageLocalPath){
        throw new ApiError(400, "File is Required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) {
        throw new ApiError(500, "Something went wrong when uploading cover image")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url}
        },
        {new: true}
    ).select("-password -refreshToken")

    return res.status(200).json(new apiResponse(200, user, "Cover image updated successfully"))
})

const getUserChannelPorfile = asyncHandler( async(req, res) => {
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400, "Username is required")
    } 
    
    const channel = await User.aggregate([
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscription",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscriberCount: {
                        $size: "$subscribers"
                    },
                    channelSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond:{ //condition
                            if: {$in:[req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                //project only the necessary data
                $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    subscriberCount: 1,
                    channelSubscribedToCount: 1,
                    isSubscribed: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ])

    if(!channel?.length){
        throw new ApiError(404, "Channel not found")
    }

    return res.status(200).json( new apiResponse(
        200,
        channel[0],
        "Channel profile fetched successfully"
    ))
})

const getWatchHistory = asyncHandler( async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1 
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if(!user?.length){
        throw new ApiError(404, "User not found")
    }
    return res.status(200).json( new apiResponse(
        200,
        user[0]?.watchHistory,
        "Watch history fetched successfully"
    ))
})
export {
     registerUser,
     loginUser,
     refreshAccessToken,
     logoutUser,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelPorfile,
     getWatchHistory
}