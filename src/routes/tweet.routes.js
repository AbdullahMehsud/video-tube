import {Router} from "express"
import {createTweet, deleteTweet, getUserTweet, updateTweet} from "../controllers/tweet.controller.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js"

const router = Router()

router.route("/create").post(verifyJwt ,createTweet)
router.route("/:username").get(verifyJwt, getUserTweet)
router.route("/:id/update-tweet").patch(verifyJwt, updateTweet)
router.route("/:id/delete-tweet").delete(verifyJwt, deleteTweet)

export default router