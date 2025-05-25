import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addPortfolioItem,
  deletePortfolioItem,
  getFreelancerPublicProfile,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/:userId', getUserProfile);
router.put('/:userId', updateUserProfile);
router.post('/:userId/portfolio', addPortfolioItem);
router.delete('/:userId/portfolio/:itemId', deletePortfolioItem);
router.get('/freelancer/:userId', getFreelancerPublicProfile);

export default router;
