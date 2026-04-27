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

    // Get exercise context for AI
    const exerciseContext = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        workout: true
      }
    });

    // Call NVIDIA API for AI Insights
    let aiInsight = null;
    if (process.env.NVIDIA_API_KEY && feedback && exerciseContext) {
      aiInsight = await getAIInsight(feedback, {
        exerciseName: exerciseContext.name,
        instructions: exerciseContext.instructions,
        workoutTitle: exerciseContext.workout.title
      });
    }

    await prisma.exerciseResult.upsert({
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

async function getAIInsight(feedback: string, context: { exerciseName: string, instructions: string, workoutTitle: string }) {
  try {
    if (!process.env.NVIDIA_API_KEY) {
      console.error("[AI Insight] NVIDIA_API_KEY is missing");
      return "AI Insight unavailable: API key missing.";
    }

    const systemPrompt = "You are an expert physical therapist analyzing a client's workout logs. Provide a short, 3-sentence insight on their progress and one area to focus on.";
    
    // Parse the data into a readable text string instead of sending raw JSON
    const userPrompt = `Workout: ${context.workoutTitle}\nExercise: ${context.exerciseName}\nInstructions: ${context.instructions}\nClient Feedback: ${feedback}`;

    console.log("[AI Insight] Sending prompt to NVIDIA:", userPrompt);

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
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 200,
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
    
    // Log the raw text response for debugging
    const rawContent = data.choices && data.choices[0]?.message?.content;
    console.log("[AI Insight] Raw NVIDIA Response:", rawContent);
    
    if (rawContent) {
      return rawContent.trim();
    }
    
    console.error("[AI Insight] Unexpected API response format:", JSON.stringify(data));
    return "Could not analyze feedback at this time.";
  } catch (error) {
    console.error("[AI Insight] Fetch error:", error);
    return "Could not analyze feedback at this time.";
  }
}
