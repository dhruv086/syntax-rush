import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createContest, getAllContests, getContestById, registerForContest } from "../controllers/contest.controller.js";

const router = express.Router();

router.route("/all-contests").get(getAllContests);
router.route("/create-contest").post(verifyJWT, createContest);
router.route("/:id").get(getContestById);
router.route("/:id/register").post(verifyJWT, registerForContest);

export default router;
