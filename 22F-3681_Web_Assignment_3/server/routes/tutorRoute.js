const express = require("express");
const { getTutorProfile, updateTutorProfile } = require("../controllers/tutorController"); 
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/profile", protect, getTutorProfile); // Fetch tutor profile
router.put("/profile", protect, upload.single("profilePicture"), updateTutorProfile); // Update tutor profile

module.exports = router;
