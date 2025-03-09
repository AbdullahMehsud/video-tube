import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router()
router.route("/:channelId/subscribe-channel").put(verifyJwt, toggleSubscription)
router.route("/:channelId/get-channel-subscriber").get(verifyJwt, getUserChannelSubscribers)
router.route("/:subsciberId/get-subscribed-channel").get(verifyJwt, getSubscribedChannels)

export default router