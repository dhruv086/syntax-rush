import { Contest } from "../models/contest.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createContest = AsyncHandler(async (req, res) => {
  const { title, description, startTime, endTime, problemIds, maxParticipants, registrationDeadline } = req.body;

  if ([title, description, startTime, endTime].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All basic fields are required");
  }

  const duration = Math.round((new Date(endTime) - new Date(startTime)) / (60 * 1000));
  if (duration <= 0) throw new ApiError(400, "End time must be after start time");

  const contest = await Contest.create({
    title,
    description,
    startTime,
    endTime,
    duration,
    problemIds,
    maxParticipants,
    registrationDeadline,
    createdBy: req.user._id
  });

  return res.status(201).json(new ApiResponse(201, { contest }, "Contest created successfully"));
});

const getAllContests = AsyncHandler(async (req, res) => {
  const contests = await Contest.find()
    .select("-participants -leaderboard")
    .sort({ startTime: -1 });
  return res.status(200).json(new ApiResponse(200, { contests }, "Contests fetched successfully"));
});

const getContestById = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const contest = await Contest.findById(id).populate("problemIds", "title difficulty");
  if (!contest) throw new ApiError(404, "Contest not found");
  return res.status(200).json(new ApiResponse(200, { contest }, "Contest fetched successfully"));
});

const registerForContest = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const contest = await Contest.findById(id);

  if (!contest) throw new ApiError(404, "Contest not found");
  if (contest.status !== "upcoming") throw new ApiError(400, "Registration closed");
  if (new Date() > new Date(contest.registrationDeadline)) throw new ApiError(400, "Registration deadline passed");

  const isAlreadyRegistered = contest.participants.some(p => String(p.userId) === String(req.user._id));
  if (isAlreadyRegistered) throw new ApiError(400, "Already registered");

  if (contest.participants.length >= contest.maxParticipants) throw new ApiError(400, "Contest full");

  contest.participants.push({ userId: req.user._id });
  await contest.save();

  return res.status(200).json(new ApiResponse(200, {}, "Registered successfully"));
});

export { createContest, getAllContests, getContestById, registerForContest };
