import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from './db/db.js';
import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import battleRoutes from './routes/battle.routes.js';
import chatRoutes from './routes/chat.routes.js';
import contestRoutes from './routes/contest.routes.js';
import groupRoutes from './routes/group.routes.js';
import messageRoutes from './routes/message.routes.js';
import socialRoutes from './routes/social.routes.js';

import { createServer } from "http";
import socketManager from "./socket/socket.js";

const app = express();
const server = createServer(app);
const io = socketManager(server);

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problem", problemRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/battles", battleRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/contest", contestRoutes);
app.use("/api/v1/group", groupRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/social", socialRoutes);

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server due to DB connection error:", err);
    process.exit(1);
  });
