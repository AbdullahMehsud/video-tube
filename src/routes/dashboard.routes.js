import { Router } from "express";
import { getChannelStates } from "../controllers/dashboard.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";


const router = Router()

router.route("/:channelId/channel-stats").get(verifyJwt, getChannelStates)

export default router