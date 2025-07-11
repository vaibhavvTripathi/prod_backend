import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export async function createPrompt({
  prompt,
  userId,
}: {
  prompt: string;
  userId: number;
}): Promise<{ promptId: number }> {
  const newPrompt = await prisma.prompt.create({
    data: { promptText: prompt, userId, createdDate: new Date() },
  });
  return { promptId: newPrompt.promptId };
}
