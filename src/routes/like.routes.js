import { Router } from "express";
import { 
    toggleVideoLike,
    toggleCommentLike,
    toggletweetLike,
    getLikedVideos,
    getCommentLikes,
    getVideoLikes,
    getTweetLikes
 } from "../controllers/like.controller.js";
 import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/:videoId/video-like").put(verifyJwt, toggleVideoLike)
router.route("/:tweetId/tweet-like").put(verifyJwt, toggletweetLike)
router.route("/:commentId/comment-like").put(verifyJwt, toggleCommentLike)
router.route("/:userId/liked-videos").get(verifyJwt, getLikedVideos)
router.route("/:commentId/comment-likes").get(verifyJwt, getCommentLikes)
router.route("/:videoId/video-likes").get(verifyJwt, getVideoLikes)
router.route("/:tweetId/tweet-likes").get(verifyJwt, getTweetLikes)


export default router