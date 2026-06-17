import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  problemNumber: {
    type: Number,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'java', 'c']
  },
  status: {
    type: String,
    required: true,
    enum: ['Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Time Limit Exceeded']
  },
  passedTests: {
    type: Number,
    default: 0
  },
  totalTests: {
    type: Number,
    default: 0
  },
  executionTime: {
    type: Number,
    default: 0
  },
  testResults: [{
    testCaseIndex: Number,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    executionTime: Number,
    error: String
  }],
  message: String
}, {
  timestamps: true
});

// Index for efficient queries
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problemNumber: 1, status: 1 });
submissionSchema.index({ user: 1, problemNumber: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission; 