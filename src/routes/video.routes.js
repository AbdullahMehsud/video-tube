import {Router} from "express"
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from '../controllers/video.controller.js'

import {upload} from '../middlewares/multer.middlewares.js'
import {verifyJwt} from '../middlewares/auth.middlewares.js'

const router = Router()

router.route("/publish-video").post(verifyJwt,
    upload.fields([
        {
            name: 'videoFile',
            maxCount: 1
        },
        {
            name: 'thumbnail',
            maxCount: 1
        }
    ]), 
    publishAVideo)

    router.route("/:videoId").get(verifyJwt ,getVideoById)
    router.route("/:videoId/delete-video").delete(verifyJwt, deleteVideo)
    router.route("/:videoId/update-video").patch(verifyJwt, upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: 'thumbnail',
            maxCount: 1
        }
    ]) ,updateVideo)
    router.route("/:userId/all-videos").get(verifyJwt, getAllVideos)
    router.route("/:videoId/video-status").patch(verifyJwt, togglePublishStatus)



export default router