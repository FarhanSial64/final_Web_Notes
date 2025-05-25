const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  console.log("req.headers:", req.headers); // Add this line

  if (!authHeader) {
    console.warn('⚠️  No Authorization header found');
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!token) {
    console.warn('⚠️  Token extraction failed');
    return res.status(401).json({ message: 'Access Denied. Invalid token format.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Include both id and role in the user object
    req.user = {
      id: decoded._id,
      role: decoded.role
    };
    console.log('✅ Token verified. User:', req.user.id, 'Role:', req.user.role);
    next();
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = authenticate;
