"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function inviteClient(email: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "THERAPIST") {
      return { success: false, error: "Unauthorized" };
    }

    const therapistId = (session.user as any).id;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.inviteToken.create({
      data: {
        token,
        therapistId,
        email,
        expiresAt,
      },
    });

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?token=${token}`;

    let emailSent = false;
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "your-resend-api-key") {
      try {
        await resend.emails.send({
          from: "MyRehab <onboarding@resend.dev>",
          to: email,
          subject: "You've been invited to MyRehab",
          html: `<p>Hello!</p><p>Your physical therapist has invited you to join MyRehab.</p><p>Click the link below to create your account:</p><a href="${inviteLink}">${inviteLink}</a>`,
        });
        emailSent = true;
      } catch (e) {
        console.error("Resend error:", e);
      }
    }

    return { success: true, inviteLink, emailSent };
  } catch (error) {
    console.error("Invite error:", error);
    return { success: false, error: "Internal server error" };
  }
}
