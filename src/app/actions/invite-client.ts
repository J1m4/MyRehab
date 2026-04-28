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
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || "MyCoach <onboarding@resend.dev>";

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // 2. Check if already linked
      const existingRelation = await prisma.clientTherapist.findUnique({
        where: {
          therapistId_clientId: {
            therapistId,
            clientId: existingUser.id,
          },
        },
      });

      if (existingRelation) {
        return { success: false, message: "Athlete is already on your roster." };
      }

      // 3. Create relationship for existing user
      await prisma.clientTherapist.create({
        data: {
          therapistId,
          clientId: existingUser.id,
        },
      });

      // 4. Send notification email
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: fromAddress,
            to: email,
            subject: `${therapistName} added you to their roster`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
                <h2 style="color: #0f172a;">New Coach Added!</h2>
                <p>Hello,</p>
                <p><strong>${therapistName}</strong> has added you to their roster on Lane One Coaching.</p>
                <p>Log in to your account to view your new training plans and start collaborating.</p>
                <div style="margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Lane One</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #94a3b8; font-size: 12px;">This is an automated notification from MyCoach.</p>
              </div>
            `,
          });
        } catch (e) {
          console.error("Resend notification error:", e);
          // We still return success because the link was created
        }
      }

      return { success: true, message: "Existing athlete found and successfully linked!", alreadyExisted: true };
    }

    // Flow B: Athlete Does Not Exist (Current Logic)
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

    if (process.env.RESEND_API_KEY) {
      try {
        const { data, error } = await resend.emails.send({
          from: fromAddress,
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

        if (error) {
          console.error("Resend API error:", error);
          return { 
            success: false, 
            error: "EMAIL_FAILED", 
            message: "Email failed to send. Invite link generated.", 
            inviteLink 
          };
        }

        return { success: true, inviteLink, emailSent: true, message: "Invite emailed successfully!" };
      } catch (e) {
        console.error("Resend exception:", e);
        return { 
          success: false, 
          error: "EMAIL_FAILED", 
          message: "Could not send email. Invite link generated.", 
          inviteLink 
        };
      }
    }

    return { success: true, inviteLink, emailSent: false, message: "Invite link generated!" };
  } catch (error) {
    console.error("Invite error:", error);
    return { success: false, error: "INTERNAL_ERROR", message: "Internal server error" };
  }
}
