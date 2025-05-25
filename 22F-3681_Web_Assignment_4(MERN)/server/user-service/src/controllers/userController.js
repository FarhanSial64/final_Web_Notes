import User from '../models/User.js';
import  sendEmail  from '../utils/sendEmail.js'; // Assuming you have an email service utility

// Utility to calculate profile completeness (simple example)
const calculateProfileCompletion = (user) => {
  let score = 0;
  if (user.name) score += 20;
  if (user.phone) score += 20;
  if (user.skills?.length) score += 20;
  if (user.portfolio?.length) score += 20;
  if (user.preferences?.categories?.length) score += 20;
  return score;
};

export const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, phone, skills, preferences } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (skills) user.skills = skills;
    if (preferences) user.preferences = preferences;

    user.profileCompleted = calculateProfileCompletion(user);
    await user.save();

    await sendEmail(
        user.email,
        'Profile Updated',
        `<p>Hello ${user.name},</p><p>Your profile was successfully updated.</p>`
    );
    
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addPortfolioItem = async (req, res) => {
  const { userId } = req.params;
  const { title, description, image, link } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.portfolio.push({ title, description, image, link });
    user.profileCompleted = calculateProfileCompletion(user);
    await user.save();

    res.json({ message: 'Portfolio item added', portfolio: user.portfolio });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deletePortfolioItem = async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.portfolio = user.portfolio.filter((item) => item._id.toString() !== itemId);
    user.profileCompleted = calculateProfileCompletion(user);
    await user.save();

    await sendEmail(
        user.email,
        'Portfolio Item Deleted',
        `<p>Hello ${user.name},</p><p>One of your portfolio items was removed.</p>`
    );

    res.json({ message: 'Portfolio item deleted', portfolio: user.portfolio });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getFreelancerPublicProfile = async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId).select(
        'name skills portfolio profileCompleted'
      );
      if (!user || user.role !== 'freelancer') {
        return res.status(404).json({ message: 'Freelancer not found' });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
};
  
