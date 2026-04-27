"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase admin client with Service Role Key for image messages
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function sendMessage(data: {
  receiverId: string;
  content: string;
  imageUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const senderId = (session.user as any).id;
    const { receiverId, content, imageUrl } = data;

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        imageUrl: imageUrl || null,
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
          html: `<p>Hello!</p><p>You have received a new message from <strong>${message.sender.name || message.sender.email}</strong>:</p><p><em>"${content || (imageUrl ? "[Image]" : "")}"</em></p><p>Log in to reply.</p>`,
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

export async function sendImageMessage(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const senderId = (session.user as any).id;
    const receiverId = formData.get("receiverId") as string;
    const content = (formData.get("content") as string) || "";
    const file = formData.get("file") as File;

    if (!file || !receiverId) {
      return { success: false, error: "Missing required fields" };
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `msg-${senderId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from('message-attachments')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase Admin Message Image Upload Error:", error);
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('message-attachments')
      .getPublicUrl(filePath);

    return await sendMessage({
      receiverId,
      content,
      imageUrl: publicUrl
    });

  } catch (error) {
    console.error("Send image message error:", error);
    return { success: false, error: "Internal server error" };
  }
}
