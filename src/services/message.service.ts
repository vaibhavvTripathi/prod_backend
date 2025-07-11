import { PrismaClient } from "../generated/prisma";

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
  return { messageId: newMessage.id };
}

export async function getMessagesByPromptId({
  promptId,
  userId,
}: {
  promptId: number;
  userId: number;
}): Promise<Array<{
  id: number;
  message: string;
  role: "user" | "model";
  createTime: Date;
}>> {
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
      createTime: 'asc',
    },
  });
  
  return messages;
} 