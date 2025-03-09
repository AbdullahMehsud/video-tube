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
router.route("/:commentId/comment-like").put(verifyJwt, toggleCommentLike)
router.route("/:userId/liked-videos").get(verifyJwt, getLikedVideos)


export default router