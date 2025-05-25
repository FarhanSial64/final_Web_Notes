import express from "express";
import {
  signup,
  login,
  verifyAccount,
  forgotPassword,
  resetPassword,
  googleAuth,
} from "../controllers/authController.js";
import { protect, authorize } from "../midlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/google", googleAuth);

// Verification route
router.get("/verify/:userId", verifyAccount);

// Protected route
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
