import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  
  chatId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  
  chatType: { 
    type: String, 
    enum: ["direct", "group"], 
    required: true 
  },
  
  
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group" 
  },
  
  
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  
  
  lastMessage: String,
  lastSender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  lastMessageTime: { 
    type: Date, 
    default: Date.now 
  },
  
  
  messageCount: { 
    type: Number, 
    default: 0 
  },
  
  
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  
  
  admins: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  
  
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }
}, { 
  timestamps: true 
});


chatSchema.index({ chatId: 1 }); // Primary lookup
chatSchema.index({ chatType: 1, "lastMessageTime": -1 }); // Chat list sorting
chatSchema.index({ participants: 1 }); // User's individual chats
chatSchema.index({ groupId: 1 }); // Group chats
chatSchema.index({ "lastMessageTime": -1 }); // Recent chats

export const Chat = mongoose.model("Chat", chatSchema);