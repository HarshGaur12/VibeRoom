import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, getLoggedInUserAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT ,logoutUser);
router.route("/renewToken").post(refreshAccessToken);

router.route("/auth/me").get(verifyJWT, getLoggedInUserAccessToken);

export default router;