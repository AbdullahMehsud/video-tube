import { Router } from "express";
import { addComment } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/:videoId/comment").post(verifyJwt, addComment)

export default router