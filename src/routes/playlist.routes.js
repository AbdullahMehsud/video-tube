import {Router} from "express"
import { 
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
 } from "../controllers/playlist.controller.js"
 import { verifyJwt } from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middlewares.js"

 const router = Router()

 router.route("/create-playlist").post(verifyJwt, upload.single('thumbnail'), createPlaylist)
 router.route("/:userId/get-user-playlists").get(verifyJwt, getUserPlaylists)
 router.route("/:playlistId/get-playlist").get(verifyJwt, getPlaylistById)
 router.route("/:playlistId/playlist/:videoId/add-video").put(verifyJwt, addVideoToPlaylist)
 router.route("/:playlistId/playlist/:videoId/remove-video").delete(verifyJwt, removeVideoFromPlaylist)
 router.route("/:playlistId/delete-playlist").delete(verifyJwt, deletePlaylist)
 router.route("/:playlistId/update-playlist").patch(verifyJwt, updatePlaylist)

 export default router
