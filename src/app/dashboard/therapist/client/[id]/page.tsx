import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ChevronLeft } from "lucide-react";
import ClientCalendarView from "@/components/dashboard/ClientCalendarView";

export default async function ClientWorkoutsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "THERAPIST") {
    return <div>Unauthorized</div>;
  }

  const therapistId = (session.user as any).id;

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
      scheduledFor: "asc",
    },
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
          <h1 className="text-3xl font-bold">{client.name || client.email}</h1>
          <p className="text-slate-500">Manage workouts and track progress</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/therapist/client/${clientId}/workout/new`}>
            <Plus className="mr-2 h-4 w-4" /> Create Workout
          </Link>
        </Button>
      </div>

      <ClientCalendarView workouts={workouts} isTherapist={true} />
    </div>
  );
}
