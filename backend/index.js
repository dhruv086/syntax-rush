import express from 'express'; // robot: Import express framework
import dotenv from "dotenv" // robot: Import environment variables
import cookieParser from "cookie-parser"; // robot: Import cookie parser middleware
import connectDB from './db/db.js'; // robot: Import database connection
import authRoutes from './routes/auth.routes.js'; // robot: Import authentication routes

dotenv.config(); // robot: Load environment variables

const app=express(); // robot: Create express app

app.use(express.json()); // robot: Parse JSON requests
app.use(cookieParser()) // robot: Parse cookies

// robot: Authentication routes
app.use("/api/v1/auth",authRoutes); // robot: Mount auth routes at /api/v1/auth

app.listen(process.env.PORT,()=>{ // robot: Start server
  console.log("server is running",process.env.PORT) // robot: Log server start
  connectDB(); // robot: Connect to database
})
