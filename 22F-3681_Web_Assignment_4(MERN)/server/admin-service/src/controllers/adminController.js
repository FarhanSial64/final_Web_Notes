import User from '../models/User.js';
import VerificationRequest from '../models/VerificationRequest.js';
import AdminActionLog from '../models/AdminActionLog.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await AdminActionLog.create({
      adminId: req.user._id,
      action: 'Updated User Role',
      targetType: 'User',
      targetId: userId,
      note: `Role changed to ${role}`
    });

    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
};

// Suspend or ban a user
export const suspendUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(userId, { isBanned: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await AdminActionLog.create({
      adminId: req.user._id,
      action: 'Suspended User',
      targetType: 'User',
      targetId: userId,
      note: `User suspended`
    });

    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ message: 'Error suspending user', error: error.message });
  }
};

// Get all verification requests
export const getVerificationRequests = async (req, res) => {
  try {
    const requests = await VerificationRequest.find().populate('userId', 'name email verificationLevel');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verification requests', error: error.message });
  }
};

// Approve verification
export const approveVerification = async (req, res) => {
  const { requestId } = req.params;
  try {
    const request = await VerificationRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    await User.findByIdAndUpdate(request.userId, { isVerified: true, verificationLevel: 'verified' });
    request.status = 'approved';
    await request.save();

    await AdminActionLog.create({
      adminId: req.user._id,
      action: 'Approved Verification',
      targetType: 'User',
      targetId: request.userId,
      note: 'Verified freelancer'
    });

    res.json({ message: 'Verification approved' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving verification', error: error.message });
  }
};

// Reject verification
export const rejectVerification = async (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body;

  try {
    const request = await VerificationRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    request.reason = reason || 'Not specified';
    await request.save();

    await AdminActionLog.create({
      adminId: req.user._id,
      action: 'Rejected Verification',
      targetType: 'User',
      targetId: request.userId,
      note: `Reason: ${reason}`
    });

    res.json({ message: 'Verification rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting verification', error: error.message });
  }
};

// Get admin dashboard stats (basic)
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalBids, totalReviews] = await Promise.all([
      User.countDocuments(),
      mongoose.model('Project').countDocuments(),
      mongoose.model('Bid').countDocuments(),
      mongoose.model('Review').countDocuments()
    ]);

    res.json({
      totalUsers,
      totalProjects,
      totalBids,
      totalReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};
