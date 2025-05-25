const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
        req.user = decoded; // Attach user info to request
        next(); // Move to the next middleware/route handler
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};
