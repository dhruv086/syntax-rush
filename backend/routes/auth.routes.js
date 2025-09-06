import express from "express";
import {Register,refreshAccessToken,Logout,sendEmailVerificationOTP,verifyEmailOTP} from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.route("/send-otp").post(rateLimiter.otpRequestLimit, sendEmailVerificationOTP);
router.route("/verify-otp").post(rateLimiter.otpVerifyLimit, verifyEmailOTP);
router.route("/register").post(Register);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(verifyJWT,Logout);

export default router;
