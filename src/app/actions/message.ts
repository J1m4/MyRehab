"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function sendMessage(data: {
  receiverId: string;
  content: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const senderId = (session.user as any).id;
    const { receiverId, content } = data;

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });

    return { success: true, message };
  } catch (error) {
    console.error("Send message error:", error);
    return { success: false, error: "Internal server error" };
  }
}
