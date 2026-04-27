"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createWorkout(data: {
  title: string;
  scheduledFor: string;
  clientId: string;
  exercises: {
    name: string;
    instructions: string;
    youtubeUrl?: string;
  }[];
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "THERAPIST") {
      return { success: false, error: "Unauthorized" };
    }

    const therapistId = (session.user as any).id;
    const { title, scheduledFor, clientId, exercises } = data;

    const workout = await prisma.workout.create({
      data: {
        title,
        scheduledFor: new Date(scheduledFor),
        clientId,
        therapistId,
        exercises: {
          create: exercises.map((ex) => ({
            name: ex.name,
            instructions: ex.instructions,
            youtubeUrl: ex.youtubeUrl || null,
          })),
        },
      },
      include: {
        client: true,
      },
    });

    // Send notification email to athlete
    if (process.env.RESEND_API_KEY && workout.client.email) {
      await resend.emails.send({
        from: "MyCoach <notifications@resend.dev>",
        to: workout.client.email,
        subject: "New Training Plan Assigned",
        html: `<p>Hello!</p><p>Your coach has assigned a new training plan: <strong>${title}</strong></p><p>Log in to view your tasks.</p>`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Create training plan error:", error);
    return { success: false, error: "Internal server error" };
  }
}
