import { Router } from "express";
import {
        addComment, 
        deleteComment, 
        getVideoComment, 
        updateComment 
        } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/:videoId/comment").post(verifyJwt, addComment)
router.route("/:commentId/update-comment").patch(verifyJwt, updateComment)
router.route("/:commentId/delete-comment").delete(verifyJwt, deleteComment)
router.route("/:videoId/get-video-comment").get(verifyJwt, getVideoComment)
export default router