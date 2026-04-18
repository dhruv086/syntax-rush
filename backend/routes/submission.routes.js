import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { submitSolution, getSubmissionById, listUserSubmissions, runCode } from "../controllers/submission.controller.js";

const router = express.Router();

router.post("/submit", verifyJWT, submitSolution);
router.post("/run", verifyJWT, runCode);
router.get("/mine", verifyJWT, listUserSubmissions);
router.get("/:id", verifyJWT, getSubmissionById);

export default router;
