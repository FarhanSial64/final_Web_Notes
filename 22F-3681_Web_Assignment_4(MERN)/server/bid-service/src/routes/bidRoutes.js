import express from 'express';
import {
  placeBid,
  getBidsByProject,
  getMyBids,
  updateBid,
  counterBid,
  updateBidStatus
} from '../controllers/bidController.js';
import { protect, authorize } from '../midlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('freelancer'), placeBid);
router.get('/my', protect, authorize('freelancer'), getMyBids);
router.get('/project/:projectId', protect, getBidsByProject);

router.put('/:bidId', protect, authorize('freelancer'), updateBid);
router.put('/:bidId/counter', protect, authorize('client'), counterBid);
router.put('/:bidId/status', protect, authorize('client'), updateBidStatus);

export default router;
