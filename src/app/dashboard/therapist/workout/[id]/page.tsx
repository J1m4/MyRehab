import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Play, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getYouTubeEmbedUrl } from "@/lib/utils";

export default async function TherapistWorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workoutId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as any).id;

  const workout = await prisma.workout.findUnique({
    where: { 
      id: workoutId,
      therapistId, // Security: Ensure this workout belongs to this therapist
    },
    include: {
      client: true,
      exercises: {
        include: {
          result: true
        }
      },
    },
  });

  if (!workout) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold">Workout not found</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/therapist">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/dashboard/therapist/client/${workout.clientId}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{workout.title}</h1>
          <p className="text-slate-500">
            For {workout.client.name || workout.client.email} • {format(new Date(workout.scheduledFor), "PPP")}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {workout.exercises.map((exercise) => {
          const embedUrl = getYouTubeEmbedUrl(exercise.youtubeUrl);
          
          return (
            <Card key={exercise.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <CardTitle>{exercise.name}</CardTitle>
                  <CardDescription className="max-w-prose mt-1 italic">
                    {exercise.instructions}
                  </CardDescription>
                </div>
                <div className="ml-4">
                  {exercise.status === "COMPLETED" ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {embedUrl ? (
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-100 border">
                    <iframe
                      width="100%"
                      height="100%"
                      src={embedUrl}
                      title={exercise.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : exercise.youtubeUrl && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Play className="h-4 w-4" />
                    <a href={exercise.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Watch Demo Video (External)
                    </a>
                  </div>
                )}
                
                {exercise.videoUrl && (
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                    <video src={exercise.videoUrl} controls className="w-full h-full" />
                  </div>
                )}

                {exercise.result && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-4">
                    <h4 className="font-semibold text-sm uppercase text-slate-400 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Client Feedback
                    </h4>
                    <p className="text-sm">"{exercise.result.feedback || "No feedback provided."}"</p>
                    
                    {exercise.result.mediaUrl && (
                      <div className="mt-2">
                        {exercise.result.mediaUrl.match(/\.(mp4|mov|webm)$/) ? (
                          <video src={exercise.result.mediaUrl} controls className="w-full max-h-64 rounded-md bg-black" />
                        ) : (
                          <img src={exercise.result.mediaUrl} alt="Client result" className="w-full max-h-64 object-cover rounded-md" />
                        )}
                      </div>
                    )}

                    {exercise.result.aiInsight && (
                      <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-xs border border-blue-100">
                        <strong>AI Insight:</strong> {exercise.result.aiInsight}
                      </div>
                    )}

                    {(exercise.result.notes || exercise.result.concerns) && (
                      <div className="pt-4 border-t border-slate-200 space-y-2">
                        <h4 className="font-semibold text-sm uppercase text-slate-400">Your Review</h4>
                        {exercise.result.notes && (
                          <div className="text-sm">
                            <span className="font-medium text-slate-700">Notes:</span> {exercise.result.notes}
                          </div>
                        )}
                        {exercise.result.concerns && (
                          <div className="text-sm flex items-start gap-2 text-orange-700 bg-orange-50 p-2 rounded">
                            <AlertCircle className="h-4 w-4 mt-0.5" />
                            <div><span className="font-medium">Concerns:</span> {exercise.result.concerns}</div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/dashboard/therapist/completed?id=${exercise.result.id}`}>
                        Update Review / Add Notes
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
