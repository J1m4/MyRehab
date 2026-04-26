"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Send notification email
    if (process.env.RESEND_API_KEY && message.receiver.email) {
      try {
        await resend.emails.send({
          from: "MyRehab <notifications@resend.dev>",
          to: message.receiver.email,
          subject: "New Message Received",
          html: `<p>Hello!</p><p>You have received a new message from <strong>${message.sender.name || message.sender.email}</strong>:</p><p><em>"${content}"</em></p><p>Log in to reply.</p>`,
        });
      } catch (e) {
        console.error("Resend error:", e);
      }
    }

    return { success: true, message };
  } catch (error) {
    console.error("Send message error:", error);
    return { success: false, error: "Internal server error" };
  }
}
