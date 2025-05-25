const express = require("express");
const { protect, authorize, adminOnly  } = require("../middleware/authMiddleware");
const {
  getPopularSubjects,
  getSessionCompletionRate,
  getUsageByCity,
  getUserGrowth
} = require("../controllers/reportController");

const router = express.Router();

router.get("/popular-subjects", protect, adminOnly, getPopularSubjects);
router.get("/session-completion-rate", protect, adminOnly, getSessionCompletionRate);
router.get("/usage-by-city", protect, adminOnly, getUsageByCity);
router.get("/user-growth", protect, adminOnly, getUserGrowth);

module.exports = router;
