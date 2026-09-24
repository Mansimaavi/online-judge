import express from 'express';
import { runCode } from '../controllers/compilerController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post("/run", auth, runCode);

export default router;