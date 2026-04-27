"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitExerciseResult(data: {
  exerciseId: string;
  feedback: string;
  mediaUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "CLIENT") {
      return { success: false, error: "Unauthorized" };
    }

    const { exerciseId, feedback, mediaUrl } = data;

    // Call NVIDIA API for AI Insights
    let aiInsight = null;
    if (process.env.NVIDIA_API_KEY && feedback) {
      aiInsight = await getAIInsight(feedback);
    }

    const result = await prisma.exerciseResult.upsert({
      where: { exerciseId },
      update: {
        feedback,
        mediaUrl: mediaUrl || null,
        aiInsight,
      },
      create: {
        exerciseId,
        feedback,
        mediaUrl: mediaUrl || null,
        aiInsight,
      },
    });

    const exercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: { status: "COMPLETED" },
      include: {
        workout: {
          include: {
            exercises: true,
            therapist: true,
            client: true,
          },
        },
      },
    });

    // Check if all exercises in workout are completed
    const allCompleted = exercise.workout.exercises.every(ex => ex.status === "COMPLETED");
    if (allCompleted) {
      await prisma.workout.update({
        where: { id: exercise.workout.id },
        data: { status: "COMPLETED" },
      });

      // Notify therapist
      if (process.env.RESEND_API_KEY && exercise.workout.therapist.email) {
        await resend.emails.send({
          from: "MyRehab <notifications@resend.dev>",
          to: exercise.workout.therapist.email,
          subject: "Workout Completed",
          html: `<p>Hello!</p><p>Your client <strong>${exercise.workout.client.name || exercise.workout.client.email}</strong> has completed their workout: <strong>${exercise.workout.title}</strong></p>`,
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Submit result error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function savePTFeedback(data: {
  resultId: string;
  notes: string;
  concerns: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "THERAPIST") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.exerciseResult.update({
      where: { id: data.resultId },
      data: {
        notes: data.notes,
        concerns: data.concerns,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Save PT feedback error:", error);
    return { success: false, error: "Internal server error" };
  }
}

async function getAIInsight(feedback: string) {
  try {
    console.log("[AI Insight] Starting analysis for feedback:", feedback);
    
    if (!process.env.NVIDIA_API_KEY) {
      console.error("[AI Insight] NVIDIA_API_KEY is missing");
      return "AI Insight unavailable: API key missing.";
    }

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta/llama3-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a physical therapy assistant. Analyze the client feedback and provide a concise insight (max 2 sentences) for the therapist regarding pain points or progress trends. Focus on identifying specific issues.",
          },
          {
            role: "user",
            content: feedback,
          },
        ],
        max_tokens: 100,
        temperature: 0.5,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[AI Insight] NVIDIA API error (${response.status}):`, errorBody);
      return "Could not analyze feedback at this time.";
    }

    const data = await response.json();
    console.log("[AI Insight] API Response received successfully");
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    console.error("[AI Insight] Unexpected API response format:", JSON.stringify(data));
    return "Could not analyze feedback at this time.";
  } catch (error) {
    console.error("[AI Insight] Fetch error:", error);
    return "Could not analyze feedback at this time.";
  }
}
