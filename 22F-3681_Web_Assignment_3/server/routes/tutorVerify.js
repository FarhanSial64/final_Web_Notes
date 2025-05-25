const express = require("express");
const { getPendingTutors, verifyTutor } = require("../controllers/tutorVerifyController");
const { protect, authorize, adminOnly  } = require("../middleware/authMiddleware");
const User = require("../models/user"); // ✅ Correct: uppercase

const router = express.Router();


router.get("/pending", protect, adminOnly, getPendingTutors);
router.post("/verify/:id", protect, adminOnly, verifyTutor);


module.exports = router;
