// routes/reviewRoutes.js
import express from 'express';
import {
  createReview,
  getFreelancerReviews,
  respondToReview,
  getAllReviews // ← new controller
} from '../controllers/reviewController.js';
import { protect, authorize } from '../midlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('client'), createReview);
router.get('/freelancer/:freelancerId', getFreelancerReviews);
router.put('/:reviewId/respond', protect, authorize('freelancer'), respondToReview);
router.get('/', protect, authorize('admin'), getAllReviews); // ← new route

export default router;
