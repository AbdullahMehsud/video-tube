import mongoose, {isValidObjectId} from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { PlaylistModel } from "../models/playlist.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler( async(req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if([name, description].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }   

    const userId = req.user?._id
    
    try {
        const playlist = await PlaylistModel.create({
            name,
            description,
            owner: userId
        })
        if(!playlist){
            throw new ApiError(401, "Some thing went wrong while creating a playlist")
        }

        return res.status(200).json(new apiResponse(201, playlist, "Playlist created successfully"))
    } catch (error) {
        console.log("error while creating playlist");
        throw new ApiError(500, "Some thing went wrong while creating a playlist")
    }
})

const getUserPlaylists = asyncHandler( async(req, res) =>{
    const userId = req.params.userId
    //TODO: get user playlist
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400, "user id is required")
    }

    try {
        const playlist = await PlaylistModel.aggregate([
            {
            $match: {owner: new mongoose.Types.ObjectId(userId)},
            },
            { 
                $project: {name: 1, description: 1, videos: 1, createdAt: 1}
            }
    ])

    if(!playlist.length){
        throw new ApiError(401, "Some thing went wrong while fetching user playlists")
    }

    return res.status(200).json( new apiResponse(201, playlist, "user playlists fetched successfully"))

    } catch (error) {
        console.log("error while fecthing user playlists", error);
        throw new ApiError(500, "Some thing went wrong while fetching user playlists")
    }
})

const getPlaylistById = asyncHandler( async( req, res) => {
    const {playlistId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Playlist ID is required")
    }

    try {
        const playlist = await PlaylistModel.find({_id:playlistId})
        if(!playlist){
            throw new ApiError(401, "some thing went wrong while fetching playlist")
        }
        return res.status(200).json(new apiResponse(201, playlist, "Playlist fetched successfully"))
    } catch (error) {
        console.log("error while fetching playlist", error);
        throw new ApiError(401, "some thing went wrong while fetching playlist")
    }
})

const addVideoToPlaylist = asyncHandler( async(req, res) => {
    const {playlistId, videoId} = req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    try {
        const playlist = await PlaylistModel.findByIdAndUpdate(
            playlistId, 
            { $addToSet: {videos: videoId}},
            {$new: true}
        )
        if(!playlist){
            throw new ApiError(400, "playlist not found")
        }

        return res.status(200).json( new apiResponse(200, playlist, "Video added successfully to the playlist"))
    } catch (error) {
        console.log("Error while adding video to the playlist", error);
        throw new ApiError(500, "Some thing went wrong while adding video to playlist")
    }

})

const removeVideoToPlaylist = asyncHandler( async( req, res) => {
    const {playlistId,videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    try {
        const playlist = await PlaylistModel.findByIdAndUpdate(
            playlistId,
            { $pull: { videos: videoId } },
            { new: true } 
        );

        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        return res.status(200).json( new apiResponse(200, playlist, "Video removed successfully from the playlist"))
    } catch (error) {
        console.log("Error while removing video to the playlist", error);
        throw new ApiError(500, "Some thing went wrong while removing video from the playlist")
    }
})

const deletePlaylist = asyncHandler( async( req, res) => {
    const {playlistId} = req.params
})

const updatePlaylist = asyncHandler( async( req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoToPlaylist,
    deletePlaylist,
    updatePlaylist
}

