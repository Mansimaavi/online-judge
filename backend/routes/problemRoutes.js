import express from 'express';
import {
  getAllProblems,
  getProblemByNumber,
  getProblemsByDifficulty,
  getProblemsByCategory,
  getProblemsByCompany,
  createProblem,
  updateProblem,
  deleteProblem
} from '../controllers/problemController.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// Public read routes
router.get('/', getAllProblems); //problems
router.get('/difficulty/:difficulty', getProblemsByDifficulty);//  /problems/difficulty/:difficulty   req.params.difficulty
router.get('/category/:category', getProblemsByCategory);// /problems/cataegory/:category    req.params.category
router.get('/company/:company', getProblemsByCompany);//  /problems/company/:company   req.params.difficulty
router.get('/:problemNumber', getProblemByNumber);//  /problems/:problemNumber   req.params.id

// Admin-only write routes
router.post('/', auth, requireAdmin, createProblem);
router.put('/:problemNumber', auth, requireAdmin, updateProblem);
router.delete('/:problemNumber', auth, requireAdmin, deleteProblem);

export default router;
