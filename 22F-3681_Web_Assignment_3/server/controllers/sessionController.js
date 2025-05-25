const Session = require("../models/session");

// Get tutor's session list
const getTutorSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ tutor: req.user.id }).populate("student", "username email");
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Accept session request
const acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session || session.tutor.toString() !== req.user.id) {
      return res.status(404).json({ message: "Session not found" });
    }
    session.status = "accepted";
    await session.save();
    res.json({ message: "Session accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Decline session request
const declineSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session || session.tutor.toString() !== req.user.id) {
      return res.status(404).json({ message: "Session not found" });
    }
    session.status = "declined";
    await session.save();
    res.json({ message: "Session declined successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Mark session as completed
const markCompleted = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session || session.tutor.toString() !== req.user.id) {
      return res.status(404).json({ message: "Session not found" });
    }
    session.status = "completed";
    session.paymentStatus = "completed"; // Assuming payment is done
    await session.save();
    res.json({ message: "Session marked as completed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get earnings summary
const getEarningsSummary = async (req, res) => {
  try {
    const sessions = await Session.find({ tutor: req.user.id, status: "completed" });
    
    const totalEarnings = sessions.reduce((sum, session) => sum + session.earnings, 0);
    const weeklyEarnings = sessions.filter(s => isWithinWeek(s.date)).reduce((sum, s) => sum + s.earnings, 0);
    const monthlyEarnings = sessions.filter(s => isWithinMonth(s.date)).reduce((sum, s) => sum + s.earnings, 0);

    res.json({ totalEarnings, weeklyEarnings, monthlyEarnings });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Helper functions to check if date is within week/month
const isWithinWeek = (date) => {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  return new Date(date) >= weekAgo;
};

const isWithinMonth = (date) => {
  const now = new Date();
  const monthAgo = new Date();
  monthAgo.setMonth(now.getMonth() - 1);
  return new Date(date) >= monthAgo;
};

module.exports = { getTutorSessions, acceptSession, declineSession, markCompleted, getEarningsSummary };
