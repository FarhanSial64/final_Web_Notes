const express = require("express");
const { 
  acceptSession, 
  declineSession, 
  markCompleted, 
  getTutorSessions, 
  getEarningsSummary 
} = require("../controllers/sessionController");

const { protect, tutorOnly } = require("../middleware/authMiddleware"); // <-- Fix here

const router = express.Router();

router.get("/tutor", protect, tutorOnly, getTutorSessions);
router.post("/:sessionId/accept", protect, tutorOnly, acceptSession);
router.post("/:sessionId/decline", protect, tutorOnly, declineSession);
router.post("/:sessionId/complete", protect, tutorOnly, markCompleted);
router.get("/earnings", protect, tutorOnly, getEarningsSummary);

module.exports = router;
