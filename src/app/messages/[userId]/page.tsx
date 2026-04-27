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
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] w-full overflow-hidden bg-white">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href="/messages">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 overflow-hidden">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback>{otherUser.name?.[0] || otherUser.email[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <h2 className="font-bold truncate">{otherUser.name || otherUser.email}</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Athlete</p>
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
