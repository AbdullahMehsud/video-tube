import { Router } from "express";
import { 
    registerUser, 
    logoutUser, 
    loginUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelPorfile,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {verifyJwt} from "../middlewares/auth.middlewares.js";

const router = Router()
// unsecured routes
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser) 
router.route("/refresh-token").post(refreshAccessToken)

//secure routes
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/change-password").post(verifyJwt, changeCurrentPassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/c/:username").get(verifyJwt, getUserChannelPorfile)
router.route("/update-account").patch(verifyJwt, updateAccountDetails)
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage)
router.route("/history").get(verifyJwt, getWatchHistory)



export default router