import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TherapistDashboard from "@/components/dashboard/TherapistDashboard";
import { redirect } from "next/navigation";

export default async function TherapistDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "THERAPIST") {
    redirect("/login");
  }

  const therapistId = (session.user as any).id;

  const clients = await prisma.clientTherapist.findMany({
    where: { therapistId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return <TherapistDashboard clients={clients} />;
}
