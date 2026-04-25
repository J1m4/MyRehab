import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;

  if (role === "THERAPIST") {
    redirect("/dashboard/therapist");
  } else {
    redirect("/dashboard/client");
  }
}
