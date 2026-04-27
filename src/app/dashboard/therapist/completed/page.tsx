import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import PTReviewForm from "./pt-review-form";
import AIInsightRegenerator from "@/components/dashboard/AIInsightRegenerator";

export default async function CompletedExercisesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}) {
  const session = await getServerSession(authOptions);
  const { id: resultId } = await searchParams;
  
  if (!session || (session.user as any).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as any).id;

  const completedResults = await prisma.exerciseResult.findMany({
    where: {
      id: resultId || undefined,
      exercise: {
        workout: {
          therapistId
        }
      }
    },
    include: {
      exercise: {
        include: {
          workout: {
            include: {
              client: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/therapist">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {resultId ? "Review Exercise" : "Completed Exercises"}
          </h1>
          {resultId && completedResults[0] && (
            <p className="text-slate-500">
              For {completedResults[0].exercise.workout.client.name || completedResults[0].exercise.workout.client.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {completedResults.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-slate-500">
              {resultId ? "Exercise result not found." : "No completed exercises found."}
            </CardContent>
          </Card>
        ) : (
          completedResults.map((result) => (
            <Card key={result.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{result.exercise.name}</CardTitle>
                  <p className="text-sm text-slate-500">
                    Workout: {result.exercise.workout.title} | {new Date(result.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase">Client Feedback</h4>
                    <p className="text-sm bg-slate-50 p-3 rounded-md italic">
                      "{result.feedback || "No feedback provided."}"
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase">AI Insight</h4>
                        <AIInsightRegenerator resultId={result.id} />
                      </div>
                      <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-xs border border-blue-100">
                        {result.aiInsight || "No analysis generated yet."}
                      </div>
                    </div>

                    {result.mediaUrl && (
                      <div className="mt-4">
                        {result.mediaUrl.match(/\.(mp4|mov|webm)$/) ? (
                          <video src={result.mediaUrl} controls className="w-full max-h-48 rounded-md bg-black" />
                        ) : (
                          <img src={result.mediaUrl} alt="Result" className="w-full max-h-48 object-cover rounded-md" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase">Therapist Review</h4>
                    <PTReviewForm resultId={result.id} initialNotes={result.notes || ""} initialConcerns={result.concerns || ""} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
