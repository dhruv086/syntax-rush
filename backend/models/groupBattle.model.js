import mongoose from "mongoose";

const groupBattleSchema = new mongoose.Schema({
  battleType: { 
    type: String, 
    enum: ["group_vs_group", "quick_group", "friendly_group"],
    required: true 
  },
  
  team1: {
    groupId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Group",
     required: true 
    },
    groupName: String,
    members: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
      },
      problemId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Problem", 
        required: true 
      },
      submissionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Submission" 
      },
      score: { 
        type: Number, 
        default: 0 
      },
      solvedAt: Date,
      status: { 
        type: String, 
        enum: ["participating", "solved", "failed"], 
        default: "participating" 
      }
    }],
    totalScore: { 
      type: Number, 
      default: 0 
    },
    problemsSolved: { 
      type: Number, 
      default: 0 
    },
    averageSolveTime: { 
      type: Number, 
      default: 0 
    }
  },
  
  team2: {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    groupName: String,
    members: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
      },
      submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
      },
      score: {
        type: Number,
        default: 0
      },
      solvedAt: Date,
      status: {
        type: String,
        enum: ["participating", "solved", "failed"],
        default: "participating"
      }
    }],
    totalScore: {
      type: Number,
      default: 0
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    averageSolveTime: {
      type: Number,
      default: 0
    }
  },
  
  // Battle details
  problemIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Problem", 
    required: true 
  }],
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  }, // in minutes
  
  // Battle status
  status: { 
    type: String, 
    enum: ["waiting", "active", "completed"], 
    default: "waiting" 
  },
  
  // Results
  winningGroup: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group" 
  },
  winningGroupName: String,
  battleResult: {
    team1Score: { 
      type: Number, 
      default: 0 
    },
    team2Score: { 
      type: Number, 
      default: 0 
    },
  },
  
  // Room management
  roomCode: String, // For custom rooms/hackathons
  isCustomRoom: { 
    type: Boolean, 
    default: false 
  },
  
  // Battle statistics
  stats: {
    totalParticipants: { 
      type: Number, 
      default: 0 
    },
    problemsSolved: { 
      type: Number, 
      default: 0 
    },
    averageSolveTime: { 
      type: Number, 
      default: 0 
    }
  }
}, { timestamps: true });

// Performance indexes
groupBattleSchema.index({ status: 1, startTime: 1 }); // Active battles
groupBattleSchema.index({ "team1.groupId": 1, status: 1 }); // Group 1 battles
groupBattleSchema.index({ "team2.groupId": 1, status: 1 }); // Group 2 battles
groupBattleSchema.index({ "team1.members.userId": 1, status: 1 }); // User's group battles
groupBattleSchema.index({ "team2.members.userId": 1, status: 1 }); // User's group battles
groupBattleSchema.index({ affectsLeaderboard: 1, status: 1 }); // Leaderboard battles

export const GroupBattle = mongoose.model("GroupBattle", groupBattleSchema);