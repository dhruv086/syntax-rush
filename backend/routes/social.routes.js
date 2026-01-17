import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  getFriendsList
} from "../controllers/social.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/search").get(searchUsers);
router.route("/requests").get(getFriendRequests);
router.route("/request").post(sendFriendRequest);
router.route("/accept").post(acceptFriendRequest);
router.route("/friends").get(getFriendsList);

export default router;
