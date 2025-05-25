// middlewares/roleMiddleware.js
const User = require('../models/User');
const Role = require('../models/Role');

// Helper function to get user's role name
const getUserRole = async (userId) => {
  try {
    const user = await User.findById(userId).populate('role');
    if (!user || !user.role) return null;

    // Handle different role formats
    if (typeof user.role === 'string') {
      return user.role;
    } else if (user.role.name) {
      return user.role.name;
    }
    return null;
  } catch (err) {
    console.error('Error getting user role:', err);
    return null;
  }
};

const isAdmin = async (req, res, next) => {
  try {
    // First check if role is directly available from token
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // If not, try to get role from database
    const roleName = await getUserRole(req.user.id);
    if (roleName === 'admin') {
      return next();
    }

    console.log(`Access denied: User ${req.user.id} with role ${roleName} tried to access admin route`);
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  } catch (err) {
    console.error('Error in isAdmin middleware:', err);
    return res.status(500).json({ message: 'Server error checking permissions' });
  }
};

const isSalesman = async (req, res, next) => {
  try {
    // First check if role is directly available from token
    if (req.user && req.user.role === 'salesman') {
      return next();
    }

    // If not, try to get role from database
    const roleName = await getUserRole(req.user.id);
    if (roleName === 'salesman') {
      return next();
    }

    console.log(`Access denied: User ${req.user.id} with role ${roleName} tried to access salesman route`);
    return res.status(403).json({ message: 'Access denied. Salesman role required.' });
  } catch (err) {
    console.error('Error in isSalesman middleware:', err);
    return res.status(500).json({ message: 'Server error checking permissions' });
  }
};

const isCustomer = async (req, res, next) => {
  try {
    // First check if role is directly available from token
    if (req.user && req.user.role === 'customer') {
      return next();
    }

    // If not, try to get role from database
    const roleName = await getUserRole(req.user.id);
    if (roleName === 'customer') {
      return next();
    }

    console.log(`Access denied: User ${req.user.id} with role ${roleName} tried to access customer route`);
    return res.status(403).json({ message: 'Access denied. Customer role required.' });
  } catch (err) {
    console.error('Error in isCustomer middleware:', err);
    return res.status(500).json({ message: 'Server error checking permissions' });
  }
};

module.exports = {
  isAdmin,
  isSalesman,
  isCustomer
};
