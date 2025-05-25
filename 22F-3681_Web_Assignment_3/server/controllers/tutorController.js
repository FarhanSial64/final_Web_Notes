const User = require("../models/user");

// Get Tutor Profile
const getTutorProfile = async (req, res) => {
  try {
    const tutor = await User.findById(req.user.id).select("-password");
    
    if (!tutor || tutor.role !== "tutor") {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    res.json(tutor);
  } catch (error) {
    console.error("Error fetching tutor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Tutor Profile
const updateTutorProfile = async (req, res) => {
  try {
    // Ensure the user is a tutor
    const tutor = await User.findById(req.user.id);
    if (!tutor || tutor.role !== "tutor") {
      return res.status(403).json({ message: "Unauthorized to update this profile" });
    }

    // Extract updated fields
    const { firstName, lastName, bio, subjects, hourlyRate, availability, teachingPreferences, location, qualifications } = req.body;

    // Handle profile picture upload if present
    let profilePicture = tutor.profilePicture; // Keep existing if not changed
    if (req.file) {
      profilePicture = req.file.path; // Assuming you use multer for image uploads
    }

    // Update the tutor profile
    const updatedTutor = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        bio,
        subjects: subjects ? subjects.split(",").map((s) => s.trim()) : tutor.subjects, // Convert string to array
        hourlyRate,
        availability: availability || tutor.availability, // Ensure existing availability isn't lost
        teachingPreferences,
        location,
        qualifications: qualifications ? qualifications.split(",").map((q) => q.trim()) : tutor.qualifications,
        profilePicture,
      },
      { new: true }
    );

    res.json(updatedTutor);
  } catch (error) {
    console.error("Error updating tutor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTutorProfile, updateTutorProfile };
