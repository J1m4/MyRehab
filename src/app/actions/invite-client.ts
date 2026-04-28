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
    const therapistName = session.user?.name || "Your Coach";
    
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
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "MyCoach <onboarding@resend.dev>",
          to: email,
          subject: `${therapistName} invited you to MyCoach`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
              <h2 style="color: #0f172a;">Welcome to MyCoach!</h2>
              <p>Hello,</p>
              <p><strong>${therapistName}</strong> has invited you to join their coaching program on MyCoach.</p>
              <p>MyCoach helps you track your training plans, message your coach, and stay on top of your performance goals.</p>
              <div style="margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Set Up Your Account</a>
              </div>
              <p style="color: #64748b; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="color: #64748b; font-size: 14px; word-break: break-all;">${inviteLink}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="color: #94a3b8; font-size: 12px;">This invitation will expire in 7 days.</p>
            </div>
          `,
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
