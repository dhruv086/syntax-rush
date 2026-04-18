import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import matchmaker from "../utils/matchmaker.js";
import { User } from "../models/user.model.js";

const socketManager = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  const rooms = new Map();

  // Socket.IO JWT authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie
          ?.split("; ")
          .find((c) => c.startsWith("accessToken="))
          ?.split("=")[1];

      if (!token) {
        // Allow unauthenticated connections for public features (global chat)
        // but mark them as unauthenticated
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_KEY
      );
      const user = await User.findById(decoded._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        return next(new Error("Invalid token — user not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      // Allow connection but mark as unauthenticated
      socket.user = null;
      next();
    }
  });

  // Periodic task to expand matchmaking tolerances and find matches
  setInterval(() => {
    matchmaker.expandTolerances();

    // Attempt to match players who are waiting
    const processedUsers = new Set();

    for (const entry of matchmaker.queue) {
      if (processedUsers.has(String(entry.user._id))) continue;

      const match = matchmaker.findMatch(entry.user._id);
      if (match) {
        const [p1, p2] = match;
        processedUsers.add(String(p1.user._id));
        processedUsers.add(String(p2.user._id));
        createMatch(p1, p2);
      }
    }
  }, 5000); // Check every 5 seconds

  /**
   * Select a problem appropriate for the average ELO of both players.
   *   Bronze/Silver (< 600)   → Easy
   *   Gold/Platinum (600-1500) → Medium (fallback Easy)
   *   Diamond/Master (>= 1500) → Hard (fallback Medium)
   */
  async function selectProblemByElo(ratingA, ratingB) {
    const { Problem } = await import("../models/problem.model.js");
    const avgRating = (ratingA + ratingB) / 2;

    let targetDifficulty;
    if (avgRating >= 1500) targetDifficulty = "Hard";
    else if (avgRating >= 600) targetDifficulty = "Medium";
    else targetDifficulty = "Easy";

    // Try target difficulty first, then fallback
    let problems = await Problem.find({ difficulty: targetDifficulty });
    if (!problems.length && targetDifficulty === "Hard") {
      problems = await Problem.find({ difficulty: "Medium" });
    }
    if (!problems.length && targetDifficulty === "Medium") {
      problems = await Problem.find({ difficulty: "Easy" });
    }
    if (!problems.length) {
      problems = await Problem.find({});
    }

    if (!problems.length) return null;
    return problems[Math.floor(Math.random() * problems.length)];
  }

  async function createMatch(playerA, playerB) {
    try {
      const { IndividualBattle } = await import(
        "../models/IndividualBattle.model.js"
      );

      const ratingA = playerA.user.performanceStats?.battlePoints || 1200;
      const ratingB = playerB.user.performanceStats?.battlePoints || 1200;

      const randomProblem = await selectProblemByElo(ratingA, ratingB);
      if (!randomProblem) {
        io.to(playerA.socketId).emit(
          "match_error",
          "No problems available for battle"
        );
        io.to(playerB.socketId).emit(
          "match_error",
          "No problems available for battle"
        );
        return;
      }

      const now = new Date();
      const durationMinutes = 20;
      const end = new Date(now.getTime() + durationMinutes * 60 * 1000);

      const battle = await IndividualBattle.create({
        battleType: playerA.matchType,
        player1: { userId: playerA.user._id, problemId: randomProblem._id },
        player2: { userId: playerB.user._id, problemId: randomProblem._id },
        problemIds: [randomProblem._id],
        startTime: now,
        endTime: end,
        status: "active",
      });

      // Notify both players
      io.to(playerA.socketId).emit("match_found", {
        battle,
        opponent: playerB.user,
      });
      io.to(playerB.socketId).emit("match_found", {
        battle,
        opponent: playerA.user,
      });

      console.log(
        `Match created: ${playerA.user.username} vs ${playerB.user.username} [${randomProblem.difficulty}]`
      );
    } catch (err) {
      console.error("Battle creation error:", err);
      io.to(playerA.socketId).emit("match_error", "Failed to create battle");
      io.to(playerB.socketId).emit("match_error", "Failed to create battle");
    }
  }

  io.on("connection", (socket) => {
    console.log(
      `User connected: ${socket.id} (${socket.user?.username || "anonymous"})`
    );

    socket.on("start_matchmaking", async ({ user, matchType }) => {
      // Use authenticated user from socket middleware when available
      const authenticatedUser = socket.user || user;
      if (!authenticatedUser?._id) {
        socket.emit("match_error", "Authentication required for matchmaking");
        return;
      }

      console.log(
        `${authenticatedUser.username} started matchmaking for ${matchType}`
      );

      // Add player to matchmaker queue
      matchmaker.addPlayer(socket.id, authenticatedUser, matchType);

      // Immediate match check
      const match = matchmaker.findMatch(authenticatedUser._id);
      if (match) {
        const [p1, p2] = match;
        createMatch(p1, p2);
      }
    });

    socket.on("cancel_matchmaking", ({ userId }) => {
      const authenticatedUserId = socket.user?._id || userId;
      matchmaker.removePlayer(authenticatedUserId);
      console.log(`User ${authenticatedUserId} cancelled matchmaking`);
    });

    socket.on("join_battle", ({ battleId, user }) => {
      socket.join(battleId);
      if (!rooms.has(battleId)) {
        rooms.set(battleId, { players: [], status: "active" });
      }
      const room = rooms.get(battleId);
      const authenticatedUser = socket.user || user;
      if (
        !room.players.find(
          (p) => String(p.userId) === String(authenticatedUser._id)
        )
      ) {
        room.players.push({
          ...authenticatedUser,
          userId: authenticatedUser._id,
          socketId: socket.id,
          progress: 0,
        });
      }
      io.to(battleId).emit("room_state", room);
    });

    socket.on("update_progress", ({ battleId, userId, progress }) => {
      const room = rooms.get(battleId);
      if (room) {
        const player = room.players.find(
          (p) => String(p.userId) === String(userId)
        );
        if (player) {
          player.progress = progress;
          socket.to(battleId).emit("opponent_progress", { userId, progress });
        }
      }
    });

    socket.on("battle_submission", ({ battleId, userId, submission }) => {
      socket
        .to(battleId)
        .emit("opponent_submitted", { userId, submission });
    });

    socket.on("disconnect", () => {
      // Find user by socketId to remove from queue
      const entry = matchmaker.queue.find((p) => p.socketId === socket.id);
      if (entry) {
        matchmaker.removePlayer(entry.user._id);
      }
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export default socketManager;
