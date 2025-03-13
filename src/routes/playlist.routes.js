import {Router} from "express"
import { 
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoToPlaylist
 } from "../controllers/playlist.controller.js"
 import { verifyJwt } from "../middlewares/auth.middlewares.js"

 const router = Router()

 router.route("/create-playlist").post(verifyJwt, createPlaylist)
 router.route("/:userId/get-user-playlists").get(verifyJwt, getUserPlaylists)
 router.route("/:playlistId/get-playlist").get(verifyJwt, getPlaylistById)
 router.route("/:playlistId/playlist/:videoId/add-video").put(verifyJwt, addVideoToPlaylist)
 router.route("/:playlistId/playlist/:videoId/remove-video").delete(verifyJwt, removeVideoToPlaylist)

 export default router
