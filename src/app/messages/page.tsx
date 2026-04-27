import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function MessagesListPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any).id;
  const role = (session?.user as any).role;

  let contacts: any[] = [];

  if (role === "THERAPIST") {
    const relations = await prisma.clientTherapist.findMany({
      where: { therapistId: userId },
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
    contacts = relations.map(r => r.client);
  } else {
    const relations = await prisma.clientTherapist.findMany({
      where: { clientId: userId },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    contacts = relations.map(r => r.therapist);
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <MessageSquare className="h-12 w-12 text-slate-300" />
              <div className="space-y-2">
                <CardTitle>No conversations yet</CardTitle>
                <CardDescription>
                  {role === "THERAPIST" 
                    ? "Invite an athlete to start communicating." 
                    : "You'll see your coach here once connected."}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Link key={contact.id} href={`/messages/${contact.id}`}>
              <Card className="hover:bg-slate-50 transition-colors mb-4">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{contact.name?.[0] || contact.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{contact.name || contact.email}</CardTitle>
                      </div>
                      <CardDescription className="truncate">Tap to view conversation</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
