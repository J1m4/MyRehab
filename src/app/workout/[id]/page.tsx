import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Play, ChevronLeft } from "lucide-react";
import Link from "next/link";
import ExerciseItem from "./exercise-item";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: workoutId } = await params;
  const session = await getServerSession(authOptions);
  const clientId = (session?.user as any).id;

  const workout = await prisma.workout.findUnique({
    where: { 
      id: workoutId,
      clientId,
    },
    include: {
      exercises: {
        include: {
          result: true,
        },
      },
    },
  });

  if (!workout) {
    return <div>Workout not found</div>;
  }

  const allCompleted = workout.exercises.every(ex => ex.status === "COMPLETED");

  return (
    <div className="container mx-auto p-4 space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/client">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{workout.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={workout.status === "COMPLETED" ? "secondary" : "default"}>
              {workout.status}
            </Badge>
            {allCompleted && workout.status === "UPCOMING" && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Ready to submit
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {workout.exercises.map((exercise) => (
          <ExerciseItem key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {allCompleted && workout.status === "UPCOMING" && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-xl font-bold">All Exercises Done!</h2>
            <p className="text-slate-600">Great job! You've completed all tasks for this workout.</p>
            {/* We could add a button here to mark the entire workout as completed */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
