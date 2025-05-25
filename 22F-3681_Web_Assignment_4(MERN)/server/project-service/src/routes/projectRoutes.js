import express from 'express';
import {
  createProject,
  getProjects,
  assignFreelancer,
  updateProject,
  addMilestone,
  logTime,
  deleteProject,
  getSingleProject,
} from '../controllers/projectController.js';
import { protect, authorize } from '../midlewares/authMiddleware.js';

const router = express.Router();

// @route   POST /projects
// @desc    Create a new project (Client only)
// @access  Protected
router.post('/', protect, authorize('client'), createProject);

// @route   GET /projects
// @desc    Get all projects (Client or Freelancer)
// @access  Protected
router.get('/', protect, getProjects);

router.get('/:id', protect, getSingleProject);

// @route   PUT /projects/:projectId
// @desc    Update project status (Client or Admin)
// @access  Protected
router.put('/:projectId', protect, updateProject);

// @route   PUT /projects/:projectId/assign
// @desc    Assign freelancer to project (Admin only)
// @access  Protected
router.put('/:projectId/assign', protect, authorize('client'), assignFreelancer);

// @route   POST /projects/:projectId/milestones
// @desc    Add milestone to project (Client only)
// @access  Protected
router.post('/:projectId/milestones', protect, authorize('client'), addMilestone);

// @route   POST /projects/:projectId/log-time
// @desc    Log time for a project (Freelancer only)
// @access  Protected
router.post('/:projectId/log-time', protect, authorize('freelancer'), logTime);

// @route   DELETE /projects/:projectId
// @desc    Delete a project (Client or Admin)
// @access  Protected
router.delete('/:projectId', protect, authorize('client', 'admin'), deleteProject);

export default router;
