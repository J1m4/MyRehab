import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Send } from "lucide-react";
import Link from "next/link";
import ChatInterface from "./chat-interface";

export default async function MessagePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: otherUserId } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any).id;

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
  });

  if (!otherUser) {
    return <div>User not found</div>;
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] container mx-auto p-4">
      <div className="flex items-center gap-4 mb-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>{otherUser.name?.[0] || otherUser.email[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold">{otherUser.name || otherUser.email}</h2>
            <p className="text-xs text-slate-500">Messaging</p>
          </div>
        </div>
      </div>

      <ChatInterface 
        initialMessages={messages} 
        currentUserId={currentUserId} 
        otherUserId={otherUserId} 
      />
    </div>
  );
}
