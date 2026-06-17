import * as problemService from '../services/problemService.js';
import fs from 'fs';
import Problem from '../models/problem.js';

export const getAllProblems = async (req, res) => {
  try {
    const problems = await problemService.getAllProblemsService();
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
};

export const getProblemByNumber = async (req, res) => {
  try {
    const problemNumber = parseInt(req.params.problemNumber);
    const problem = await problemService.getProblemByNumberService(problemNumber);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProblemsByDifficulty = async (req, res) => {
  try {
    const difficulty = req.params.difficulty;
    const problems = await problemService.getProblemsByDifficultyService(difficulty);
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProblemsByTopic = async (req, res) => {
  try {
    const topic = req.params.topic;
    const problems = await problemService.getProblemsByTopicService(topic);
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProblemsByCompany = async (req, res) => {
  try {
    const company = req.params.company;
    const problems = await problemService.getProblemsByCompanyService(company);
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchProblemsByTitle = async (req, res) => {
  try {
    const { query } = req.query;
    const results = await problemService.searchProblemsByTitleService(query || '');
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProblemsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const problems = await problemService.getProblemsByCategoryService(category);
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
