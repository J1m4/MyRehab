"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

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

      // Notify coach
      if (process.env.RESEND_API_KEY && exercise.workout.therapist.email) {
        await resend.emails.send({
          from: "MyCoach <notifications@resend.dev>",
          to: exercise.workout.therapist.email,
          subject: "Training Session Completed",
          html: `<p>Hello!</p><p>Your athlete <strong>${exercise.workout.client.name || exercise.workout.client.email}</strong> has completed their training session: <strong>${exercise.workout.title}</strong></p>`,
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
    console.error("Save coaching feedback error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function regenerateAIInsight(resultId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "THERAPIST") {
      return { success: false, error: "Unauthorized" };
    }

    const result = await prisma.exerciseResult.findUnique({
      where: { id: resultId },
      include: {
        exercise: {
          include: {
            workout: true
          }
        }
      }
    });

    if (!result || !result.feedback) {
      return { success: false, error: "Result or feedback not found" };
    }

    const aiInsight = await getAIInsight(result.feedback, {
      exerciseName: result.exercise.name,
      instructions: result.exercise.instructions,
      workoutTitle: result.exercise.workout.title
    });

    await prisma.exerciseResult.update({
      where: { id: resultId },
      data: { aiInsight }
    });

    revalidatePath("/dashboard/therapist/workout/[id]", "page");
    revalidatePath("/dashboard/therapist/completed", "page");

    return { success: true, insight: aiInsight };
  } catch (error) {
    console.error("Regenerate AI Insight error:", error);
    return { success: false, error: "Internal server error" };
  }
}

async function getAIInsight(feedback: string, context: { exerciseName: string, instructions: string, workoutTitle: string }) {
  try {
    if (!process.env.NVIDIA_API_KEY) {
      console.error("[AI Insight] CRITICAL ERROR: NVIDIA_API_KEY is missing from environment variables.");
      return "AI Insight unavailable: System configuration error (API Key Missing).";
    }

    // Define strict prompts
    const systemPrompt = "You are an expert, encouraging performance coach. Analyze the following athlete workout data. Provide a brief, 2-sentence insight on their progress, and 1 specific tip for their next session. Be professional but warm. Do not use markdown or lists.";
    
    // Payload Parsing: Clean, readable text string (No raw JSON)
    const userPrompt = `Athlete completed ${context.exerciseName} as part of the ${context.workoutTitle} training plan. Athlete Notes: ${feedback}`;

    console.log("[AI Insight] Requesting insight from NVIDIA...");
    console.log("[AI Insight] Parsed Data String:", userPrompt);

    const models = ["meta/llama-3.1-70b-instruct", "meta/llama-3.1-8b-instruct"];
    let lastError = null;

    for (const model of models) {
      try {
        console.log(`[AI Insight] Attempting with model: ${model}`);
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
          },
          body: JSON.stringify({
            model: model,
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
            max_tokens: 250,
            temperature: 0.5,
            top_p: 1,
          }),
        });

        // Aggressive Error Logging
        if (!response.ok) {
          const status = response.status;
          const errorText = await response.text();
          console.error('NVIDIA API ERROR:', status, errorText);
          lastError = `NVIDIA API returned status ${status}.`;
          continue; // Try next model
        }

        const data = await response.json();
        
        // Extract and log raw response for terminal debugging
        const aiContent = data.choices?.[0]?.message?.content;
        
        if (aiContent) {
          const cleanContent = aiContent.trim();
          console.log("[AI Insight] RAW NVIDIA RESPONSE TEXT:", cleanContent);
          return cleanContent;
        }
      } catch (err: any) {
        console.error(`[AI Insight] Error with model ${model}:`, err);
        lastError = err.message;
      }
    }

    return `AI Insight failed: ${lastError || "Could not reach AI provider"}.`;
  } catch (error: any) {
    console.error("[AI Insight] FETCH EXCEPTION:", error);
    return `AI Insight failed: ${error?.message || "Internal network error"}.`;
  }
}
