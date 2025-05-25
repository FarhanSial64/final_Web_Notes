import express from 'express';
import {
  getPlatformStats,
  getSkillPopularity,
  getRevenueStats,
  getSignupTrends,
  getProjectPostingTrends
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../midlewares/authMiddleware.js';

const router = express.Router();

// GET platform statistics (with optional ?export=csv/pdf)
router.get('/platform',protect, authorize('admin'),getPlatformStats);

// GET skill popularity data (with optional ?export=csv/pdf)
router.get('/skills',protect, authorize('admin'), getSkillPopularity);

// GET total and average revenue (with optional ?export=csv/pdf)
router.get('/revenue',protect, authorize('admin'), getRevenueStats);

// GET signup trends over last 30 days (with optional ?export=csv/pdf)
router.get('/signup-trends',protect, authorize('admin'), getSignupTrends);

// GET project posting trends over last 30 days (with optional ?export=csv/pdf)
router.get('/project-trends',protect, authorize('admin'), getProjectPostingTrends);

export default router;
