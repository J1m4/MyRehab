"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Dumbbell, Calendar, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default function ClientDashboard({ workouts }: { workouts: any[] }) {
  const upcomingWorkouts = workouts.filter((w) => w.status === "UPCOMING");
  const completedWorkouts = workouts.filter((w) => w.status === "COMPLETED");

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-slate-500">Stay on track with your recovery</p>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {upcomingWorkouts.length === 0 ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <Clock className="h-12 w-12 text-slate-300" />
                <div className="space-y-2">
                  <CardTitle>No upcoming workouts</CardTitle>
                  <CardDescription>
                    Your therapist will assign your next tasks soon.
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          ) : (
            upcomingWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {completedWorkouts.length === 0 ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-slate-300" />
                <div className="space-y-2">
                  <CardTitle>No completed workouts yet</CardTitle>
                  <CardDescription>
                    Complete your assigned tasks to track your progress.
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          ) : (
            completedWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkoutCard({ workout }: { workout: any }) {
  return (
    <Card className="hover:border-slate-400 transition-colors">
      <Link href={`/workout/${workout.id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>{workout.title}</CardTitle>
            <CardDescription className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {format(new Date(workout.scheduledFor), "PPP")}
            </CardDescription>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-slate-500">
            <Dumbbell className="mr-1 h-4 w-4" />
            {workout.exercises.length} exercises
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
