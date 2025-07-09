import { OAuth2Client, TokenPayload } from "google-auth-library";
import { PrismaClient } from "../generated/prisma";
import jwt from "jsonwebtoken";

const client = new OAuth2Client();
const prisma = new PrismaClient();
const JWT_KEY = process.env.JWT_KEY;

export async function verifyGoogleIdToken(
  credential: string,
  clientId: string
) {
  try {
    if (!JWT_KEY) {
      throw new Error("JWT_KEY environment variable is not set");
    }
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google ID token payload");
    }
    const email = payload.email;
    const firstname = payload.given_name || "";
    const lastname = payload.family_name || "";
    if (!email) {
      throw new Error("Google account does not have an email");
    }
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          first: firstname,
          lastname,
          password: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
    // Generate JWT token with userId
    const token = jwt.sign({ userId: user.id }, JWT_KEY as string, {
      expiresIn: "7d",
    });
    return {
      token,
    };
  } catch (err) {
    console.log(err);
  }
}

export async function getUserById(userId: number | string) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) {
    throw new Error("User not found");
  }
  return {
    id: user.id,
    email: user.email,
    first: user.first,
    lastname: user.lastname,
  };
}
