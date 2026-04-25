import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import { redirect } from "next/navigation";

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "CLIENT") {
    redirect("/login");
  }

  const clientId = (session.user as any).id;

  const workouts = await prisma.workout.findMany({
    where: { clientId },
    include: {
      exercises: true,
    },
    orderBy: {
      scheduledFor: "desc",
    },
  });

  return <ClientDashboard workouts={workouts} />;
}
