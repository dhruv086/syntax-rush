import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  // Basic contest information
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  description: { 
    type: String, 
    required: true 
  },
  
  // Contest timing
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
  
  // Contest configuration
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  maxParticipants: { 
    type: Number, 
    default: 1000 
  },
  
  registrationDeadline: { 
    type: Date, 
    required: true 
  },
  
  // Contest type and rules
  contestType: { 
    type: String, 
    enum: ["individual", "team", "hackathon"], 
    default: "individual" 
  },
  
  difficulty: { 
    type: String, 
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"], 
    default: "Intermediate" 
  },
  
  // Problems in this contest
  problemIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Problem", 
    required: true 
  }],
  
  // Contest participants
  participants: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    joinedAt: { 
      type: Date, 
      default: Date.now 
    },
    
    score: { 
      type: Number, 
      default: 0 
    },
    
    problemsSolved: { 
      type: Number, 
      default: 0 
    },
    
    rank: { 
      type: Number, 
      default: 0 
    },
    
    lastSubmissionAt: Date,
    
    isDisqualified: { 
      type: Boolean, 
      default: false 
    },
    
    disqualificationReason: String
  }],
  
  // Contest status
  status: { 
    type: String, 
    enum: ["upcoming", "active", "past", "cancelled"], 
    default: "upcoming" 
  },
  
  // Contest results and leaderboards
  leaderboard: {
    global: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      score: Number,
      rank: Number,
      problemsSolved: Number
    }],
    
    country: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      score: Number,
      rank: Number,
      problemsSolved: Number
    }],
    
    college: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      score: Number,
      rank: Number,
      problemsSolved: Number
    }]
  },
  
  // Contest statistics
  stats: {
    totalParticipants: { 
      type: Number, 
      default: 0 
    },
    
    totalSubmissions: { 
      type: Number, 
      default: 0 
    },
    
    successfulSubmissions: { 
      type: Number, 
      default: 0 
    },
    
    averageScore: { 
      type: Number, 
      default: 0 
    },
    
    highestScore: { 
      type: Number, 
      default: 0 
    }
  },
  
 
  
  // Contest creator and admin
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  
  // Contest announcements
  announcements: [{
    title: String,
    content: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    postedAt: { type: Date, default: Date.now },
  }]
}, { 
  timestamps: true 
});

// Performance indexes
contestSchema.index({ status: 1, startTime: 1 }); // Contest discovery
contestSchema.index({ "participants.userId": 1, status: 1 }); // User's contests
contestSchema.index({ startTime: 1 }); // Upcoming contests
contestSchema.index({ endTime: 1 }); // Past contests
contestSchema.index({ isPublic: 1, isActive: 1 }); // Public active contests
contestSchema.index({ "leaderboard.global.rank": 1 }); // Global leaderboard
contestSchema.index({ "leaderboard.country.rank": 1 }); // Country leaderboard
contestSchema.index({ "leaderboard.college.rank": 1 }); // College leaderboard

export const Contest = mongoose.model("Contest", contestSchema);