import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createGroup,
  getMyGroups,
  joinGroup,
  getGroupDetails,
  getJoinRequests,
  handleJoinRequest,
  searchGroups,
  updateGroup,
  leaveGroup,
  promoteMember,
  getGroupSuggestions
} from "../controllers/group.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/create").post(createGroup);
router.route("/my-groups").get(getMyGroups);
router.route("/search").get(searchGroups);
router.route("/suggestions").get(getGroupSuggestions);
router.route("/:id").get(getGroupDetails).patch(updateGroup);
router.route("/:id/join").post(joinGroup);
router.route("/:id/leave").post(leaveGroup);
router.route("/:id/promote").post(promoteMember);
router.route("/:id/requests").get(getJoinRequests);
router.route("/:id/requests/handle").post(handleJoinRequest);

export default router;
