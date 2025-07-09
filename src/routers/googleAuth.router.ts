import { Router } from "express";
import { verifyGoogleAuth, getUserFromToken } from "../controllers/googleAuth.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// POST /api/v0.1/auth/verify-google
router.post("/verify-google", verifyGoogleAuth);

// GET /api/v0.1/auth/me (protected)
router.get("/me", authMiddleware, getUserFromToken);

export default router; 