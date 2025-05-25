const jwt = require("jsonwebtoken");
const User = require("../models/user");  

// Middleware to verify if the user is authenticated
const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  console.log("Token received:", req.headers.authorization);
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Extract token
    token = token.split(" ")[1]; 

    // Decode token 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const foundUser = await User.findById(decoded.userId).select("-password");

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = foundUser;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Middleware to check if the user has the required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: Access denied" });
        }
        next();
    };
};

// Middleware for Admin Only Access
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
};

// ✅ NEW: Middleware for Tutor Only Access
const tutorOnly = (req, res, next) => {
    if (req.user && req.user.role === "tutor") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Tutors only." });
    }
};

module.exports = { protect, authorize, adminOnly, tutorOnly };
