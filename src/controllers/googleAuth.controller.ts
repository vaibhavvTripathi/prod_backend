import { Request, Response } from "express";
import { verifyGoogleIdToken, getUserById } from "../services/googleAuth.service";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

interface GoogleAuthRequest {
  credential: string;
  clientId: string;
}

export const verifyGoogleAuth = async (
  req: Request<{}, {}, GoogleAuthRequest>,
  res: Response
): Promise<void> => {
  try {
    const { credential, clientId } = req.body;
    if (!credential || !clientId) {
      res.status(400).json({ error: "Missing credential or clientId" });
      return;
    }
    const result = await verifyGoogleIdToken(credential, clientId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || "Invalid Google ID token" });
  }
};

export const getUserFromToken = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await getUserById(req.user.userId);
    res.status(200).json(user);
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || "Server error" });
    }
  }
}; 