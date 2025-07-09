import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_KEY = process.env.JWT_KEY;

export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!JWT_KEY) {
    throw new Error("JWT_KEY environment variable is not set");
  }
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_KEY) as { userId?: unknown };
    if (typeof decoded.userId !== "string") {
      return res.status(401).json({ error: "Invalid token payload: userId missing or not a string" });
    }
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
