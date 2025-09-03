import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otpHash: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  purpose: {
    type: String,
    enum: ['signup', 'login', 'password_reset'],
    default: 'signup'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes TTL
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

otpSchema.index({ email: 1, purpose: 1, createdAt: -1 });

export const otp = mongoose.model("otp", otpSchema);