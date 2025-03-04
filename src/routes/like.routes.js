import { Router } from "express";
import { 
    toggleVideoLike,
    toggleCommentLike,
    toggletweetLike,
    getLikedVideos
 } from "../controllers/like.controller.js";
 import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/:videoId/video-like").put(verifyJwt, toggleVideoLike)
router.route("/:tweetId/tweet-like").put(verifyJwt, toggletweetLike)


export default router