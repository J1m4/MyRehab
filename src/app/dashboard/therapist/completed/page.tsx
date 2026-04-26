import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import PTReviewForm from "./pt-review-form";

export default async function CompletedExercisesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as any).id;

  const completedResults = await prisma.exerciseResult.findMany({
    where: {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Completed Exercises</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/therapist">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {completedResults.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-slate-500">
              No completed exercises found.
            </CardContent>
          </Card>
        ) : (
          completedResults.map((result) => (
            <Card key={result.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{result.exercise.name}</CardTitle>
                  <p className="text-sm text-slate-500">
                    Client: {result.exercise.workout.client.name} | {new Date(result.createdAt).toLocaleDateString()}
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
                    {result.mediaUrl && (
                      <div className="mt-2">
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
