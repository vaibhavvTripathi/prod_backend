import { PrismaClient } from "../generated/prisma";
import { getRedis } from "./redis.service";

const prisma = new PrismaClient();

export async function addMessage({
  promptId,
  message,
  userId,
  role,
}: {
  promptId: number;
  message: string;
  userId: number;
  role: "user" | "model";
}): Promise<{ messageId: number }> {
  const newMessage = await prisma.message.create({
    data: {
      roomId: promptId,
      message,
      userId,
      role,
      createTime: new Date(),
    },
  });

  // Cache the new message
  const cacheKey = `${userId}-${promptId}`;
  const redis = getRedis();

  try {
    // Get existing messages from cache
    const cachedMessages = await redis.get(cacheKey);
    let messages = cachedMessages ? JSON.parse(cachedMessages) : [];

    // Add the new message to the array
    messages.push({
      id: newMessage.id,
      message: newMessage.message,
      role: newMessage.role,
      createTime: newMessage.createTime,
    });

    // Update cache with new message array
    await redis.setex(cacheKey, 3600, JSON.stringify(messages)); // Cache for 1 hour
  } catch (error) {
    console.error("Failed to cache message:", error);
    // Continue execution even if caching fails
  }

  return { messageId: newMessage.id };
}

export async function getMessagesByPromptId({
  promptId,
  userId,
}: {
  promptId: number;
  userId: number;
}): Promise<
  Array<{
    id: number;
    message: string;
    role: "user" | "model";
    createTime: Date;
  }>
> {
  const cacheKey = `${userId}-${promptId}`;
  const redis = getRedis();

  try {
    const cachedMessages = await redis.get(cacheKey);
    if (cachedMessages) {
      const messages = JSON.parse(cachedMessages);
      return messages.map((msg: any) => ({
        ...msg,
        createTime: new Date(msg.createTime),
      }));
    }
  } catch (error) {
    console.error("Failed to retrieve from cache:", error);
  }

  const messages = await prisma.message.findMany({
    where: {
      roomId: promptId,
      userId: userId,
    },
    select: {
      id: true,
      message: true,
      role: true,
      createTime: true,
    },
    orderBy: {
      createTime: "asc",
    },
  });

  try {
    await redis.setex(cacheKey, 3600, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to cache messages:", error);
  }

  return messages;
}
