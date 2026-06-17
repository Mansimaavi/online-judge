import express from 'express';
import submitController from '../controllers/submitController.js';

const router = express.Router();

// Route to submit a solution (POST /api/submit/)
router.post('/', submitController.submitSolution);

// If you plan to add these later, keep them commented or implement the controllers
// router.get('/', submitController.getAllSubmissions);
// router.get('/:submissionId', submitController.getSubmissionById);

export default router;
