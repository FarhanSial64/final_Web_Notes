import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  suspendUser,
  getVerificationRequests,
  approveVerification,
  rejectVerification,
  getDashboardStats,
} from '../controllers/adminController.js';

import { protect, authorize } from '../midlewares/authMiddleware.js';

const router = express.Router();

// All admin routes are protected and restricted to admin users
router.use(protect, authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/suspend', suspendUser);

// Verification handling
router.get('/verifications', getVerificationRequests);
router.put('/verifications/:requestId/approve', approveVerification);
router.put('/verifications/:requestId/reject', rejectVerification);

// Admin dashboard
router.get('/dashboard', getDashboardStats);

export default router;
