import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import {
  getAllUsers,
  updateUserRole,
  getSystemStatistics,
  getAllSubmissions,
} from '../controllers/adminController.js';

const router = express.Router();

// Every route here is admin-only.
router.use(auth, requireAdmin);

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/statistics', getSystemStatistics);
router.get('/submissions', getAllSubmissions);

export default router;
