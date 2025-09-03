import mongoose from "mongoose";

const codingProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  problemNumber:{
    type: Number,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    text: true
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: {
      type: Boolean,
      default: false
    },
    points: {
      type: Number,
      default: 1
    }
  }],
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
    index: true
  },
  totalProblem:{
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  timeLimitMs: {
    type: Number,
    default: 2000
  },
  memoryLimitKb: {
    type: Number,
    default: 256000
  },
  tags: [{
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["linked_list", "array", "math", "string", "graph", "dynamic_programming", "greedy", "other"],
      default: "other"
    }
  }],
  // Statistics embedded
  stats: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    successfulSubmissions: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    }
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for coding problems
codingProblemSchema.index({ title: 1 });
codingProblemSchema.index({ difficulty: 1, isActive: 1 });
codingProblemSchema.index({ "tags.name": 1 });

export const CodingProblem = mongoose.model("Problem", codingProblemSchema);