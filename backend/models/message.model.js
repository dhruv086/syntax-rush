import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // Chat reference
  chatId: { 
    type: String, 
    required: true 
  },
  
  // Sender information
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // Message content
  content: String,
  
  // Message type
  messageType: { 
    type: String, 
    enum: ["text", "code", "file", "battle_invite", "battle_result", "system"], 
    default: "text" 
  },
  
  // For code messages
  code: {
    language: String,
    fileName: String
  },
  
  // For file messages
  file: {
    fileName: String,
    fileUrl: String,
    fileType: String
  },
  
  // For battle invites (Friendly battles in chat)
  battleInvite: {
    battleType: { 
      type: String, 
      enum: ["1v1_friendly", "group_friendly"] 
    },
    problemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Problem" 
    },
    duration: Number, // in minutes
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    status: { 
      type: String, 
      enum: ["pending", "accepted", "declined", "expired"] 
    }
  },
  
  // For battle results
  battleResult: {
    battleId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Battle" 
    },
    winner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    scores: {
      player1: { type: Number, default: 0 },
      player2: { type: Number, default: 0 }
    },
    duration: Number
  },
  
  
  // Read receipts
  readBy: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    readAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { 
  timestamps: true 
});

// Performance indexes
messageSchema.index({ chatId: 1, "createdAt": -1 }); // Chat messages
messageSchema.index({ sender: 1, "createdAt": -1 }); // User's messages
messageSchema.index({ "readBy.userId": 1 }); // Read receipts
messageSchema.index({ messageType: 1 }); // Message type filtering

export const Message = mongoose.model("Message", messageSchema);