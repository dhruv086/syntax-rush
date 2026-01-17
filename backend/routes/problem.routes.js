import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createProblem, getAllProblems, getAdminProblems, getProblemById } from "../controllers/problem.controller.js";

const router = express.Router();

router.route("/create-problem").post(verifyJWT, createProblem);
router.route("/all-problems").get(getAllProblems);
router.route("/admin/my-problems").get(verifyJWT, getAdminProblems);
router.route("/:id").get(getProblemById);


export default router;
