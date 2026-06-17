import Problem from '../models/problem.js';

// Create a new problem
export const createProblemService = async (data) => {
  const problem = new Problem(data);
  return await problem.save();
};

// Get all problems sorted by problemNumber
export const getAllProblemsService = async () => {
  return await Problem.find().sort({ problemNumber: 1 });
};

// Get a single problem by its problemNumber
export const getProblemByNumberService = async (problemNumber) => {
  return await Problem.findOne({ problemNumber });
};

// Update a problem by problemNumber
export const updateProblemByNumberService = async (problemNumber, updateData) => {
  return await Problem.findOneAndUpdate(
    { problemNumber },
    updateData,
    { new: true }
  );
};

// Delete a problem by problemNumber
export const deleteProblemByNumberService = async (problemNumber) => {
  return await Problem.findOneAndDelete({ problemNumber });
};

// Get problems by difficulty (Easy, Medium, Hard)
export const getProblemsByDifficultyService = async (difficulty) => {
  return await Problem.find({ difficulty }).sort({ problemNumber: 1 });
};

// Get problems by category (e.g., "Array", "Graph", etc.)
export const getProblemsByCategoryService = async (category) => {
  return await Problem.find({ category }).sort({ problemNumber: 1 });
};

// Get problems by company name (asked in)
export const getProblemsByCompanyService = async (company) => {
  return await Problem.find({ companiesAskedIn: company }).sort({ problemNumber: 1 });
};

// Search problems by title substring (case-insensitive)
export const searchProblemsByTitleService = async (query) => {
  return await Problem.find({ title: { $regex: query, $options: 'i' } }).sort({ problemNumber: 1 });
};
