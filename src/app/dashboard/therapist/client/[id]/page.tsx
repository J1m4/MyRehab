import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Dumbbell, Calendar, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export default async function ClientWorkoutsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const session = await getServerSession(authOptions);
  const therapistId = (session?.user as any).id;

  const client = await prisma.user.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    return <div>Client not found</div>;
  }

  const workouts = await prisma.workout.findMany({
    where: {
      clientId,
      therapistId,
    },
    include: {
      exercises: true,
    },
    orderBy: {
      scheduledFor: "desc",
    },
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{client.name || client.email}</h1>
          <p className="text-slate-500">Manage workouts and track progress</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/therapist/client/${clientId}/workout/new`}>
            <Plus className="mr-2 h-4 w-4" /> Create Workout
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workouts.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <Dumbbell className="h-12 w-12 text-slate-300" />
              <div className="space-y-2">
                <CardTitle>No workouts assigned</CardTitle>
                <CardDescription>
                  Start by creating the first workout for this client.
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{workout.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(workout.scheduledFor), "PPP")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {workout.status === "COMPLETED" ? (
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Completed
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600 text-sm font-medium">
                      <Clock className="mr-1 h-4 w-4" /> Upcoming
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500">
                  {workout.exercises.length} exercises
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/therapist/workout/${workout.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
