// reportController.js
const User = require("../models/user");
const Session = require("../models/session");

// Get Popular Subjects
const getPopularSubjects = async (req, res) => {
  try {
    const subjects = await Session.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } }, // Count occurrences of each subject
      { $sort: { count: -1 } }, // Sort by highest count
      { $limit: 5 } // Get top 5 subjects
    ]);

    res.json(subjects);
  } catch (error) {
    console.error("Error fetching popular subjects:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get Session Completion Rate
const getSessionCompletionRate = async (req, res) => {
  try {
    const completedSessions = await Session.countDocuments({ status: "completed" });
    const totalSessions = await Session.countDocuments();
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    res.json({ completionRate: completionRate.toFixed(2) });
  } catch (error) {
    console.error("Error fetching session completion rate:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Platform Usage by City
const getUsageByCity = async (req, res) => {
  try {
    const usageByCity = await User.aggregate([
      {
        $match: { role: { $in: ["student", "tutor"] } } // Consider only students and tutors for usage
      },
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(usageByCity);
  } catch (error) {
    console.error("Error fetching platform usage by city:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Growth Over Time
const getUserGrowth = async (req, res) => {
  try {
    const growth = await User.aggregate([
      {
        $match: { role: { $in: ["student", "tutor"] } } // Consider only students and tutors for growth
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(growth);
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPopularSubjects,
  getSessionCompletionRate,
  getUsageByCity,
  getUserGrowth
};