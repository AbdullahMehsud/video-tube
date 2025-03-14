import { Router } from "express";
import { getChannelStates, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";


const router = Router()

router.route("/:channelId/channel-stats").get(verifyJwt, getChannelStates)
router.route("/:channelId/channel-videos").get(verifyJwt, getChannelVideos)

export default router