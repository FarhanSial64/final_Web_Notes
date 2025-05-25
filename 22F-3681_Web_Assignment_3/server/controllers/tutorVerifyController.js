const User = require("../models/user");
// Fetch all pending tutors
const getPendingTutors = async (req, res) => {
     try {

      const pendingTutors = await User.find({ role: "tutor" });
      res.json(pendingTutors);

    } catch (error) {
      console.error("Error fetching pending tutors:", error); // Log the full error
      res.status(500).json({ message: "Server error. Failed to fetch tutors." });
    }
  };
// Approve or Reject a tutor
const verifyTutor = async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body; // "approved" or "rejected"

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value. Choose 'approved' or 'rejected'." });
  }

  try {
    
    const tutor = await User.findOne({ _id: id, role: "tutor" });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    tutor.verificationStatus = status;
    tutor.verificationComments = comments || "No comments provided";
    const savedTutor = await tutor.save();

    res.json({
        message: `Tutor ${status} successfully.`,
        updatedTutor: {
            tutor: {
                id: savedTutor._id,
                verificationStatus: savedTutor.verificationStatus,
                verificationComments: savedTutor.verificationComments,
            },
        },
    });

  } catch (error) {
    console.error("Error verifying tutor:", error);
    res.status(500).json({ message: "Server error while verifying tutor" });
  }
};

module.exports = { getPendingTutors, verifyTutor };
