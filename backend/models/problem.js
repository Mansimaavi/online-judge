import mongoose from 'mongoose';

const allowedCategories = [
  "Array", "String", "Math", "Basic Math", "Dynamic Programming", "Tree", "Graph",
  "Greedy", "Stack", "Queue", "Hash Table", "Heap",
  "Binary Search", "Binary Tree", "Binary Search Tree",
  "Binary Indexed Tree", "Segment Tree", "Trie",
  "Union Find", "Disjoint Set", "Recursion", "Hashing"
];

// Sub-schema for test cases
const testCaseSchema = new mongoose.Schema({
  input: { type: mongoose.Schema.Types.Mixed, required: true },
  output: { type: mongoose.Schema.Types.Mixed, required: true },
}, { _id: false });

const problemSchema = new mongoose.Schema({
  problemNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  category: {
    type: String,
    required: true,
    validate: {
      validator: function (cat) {
        return allowedCategories.includes(cat);
      },
      message: props => `${props.value} is not a valid category`,
    }
  },
  constraints: {
    type: [String],
    required: true,
    default: [],
  },
  sampleInput: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  sampleOutput: {
    type: [mongoose.Schema.Types.Mixed],   // changed from single value to array
    required: true,
  },
  defaultCode: {
    type: Map,
    of: String,
    default: {},
  },
  boilerplate: {
    type: Map,
    of: String,
    default: {},
  },
  testCases: {
    type: [testCaseSchema],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  companiesAskedIn: {
    type: [String],
    default: [],
  },
  author: {
    type: String,
    default: "admin",
  },
}, {
  timestamps: true,
  strict: false,   // allows extra unlisted fields
});

export default mongoose.model('Problem', problemSchema);
