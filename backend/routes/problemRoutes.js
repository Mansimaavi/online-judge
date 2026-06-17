import express from 'express';
import {
  getAllProblems,
  getProblemByNumber,
  getProblemsByDifficulty,
  getProblemsByCategory,
  getProblemsByCompany
} from '../controllers/problemController.js';

const router = express.Router();

router.get('/', getAllProblems); //problems
router.get('/difficulty/:difficulty', getProblemsByDifficulty);//  /problems/difficulty/:difficulty   req.params.difficulty
router.get('/category/:category', getProblemsByCategory);// /problems/cataegory/:category    req.params.category
router.get('/company/:company', getProblemsByCompany);//  /problems/company/:company   req.params.difficulty
router.get('/:problemNumber', getProblemByNumber);//  /problems/:problemNumber   req.params.id
export default router;
