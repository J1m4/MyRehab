"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { sendMessage } from "@/app/actions/message";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function ChatInterface({ 
  initialMessages, 
  currentUserId, 
  otherUserId 
}: { 
  initialMessages: any[], 
  currentUserId: string, 
  otherUserId: string 
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    const optimisticMessage = {
      id: "temp-" + Date.now(),
      senderId: currentUserId,
      receiverId: otherUserId,
      content,
      createdAt: new Date(),
    };

    setMessages([...messages, optimisticMessage]);
    setContent("");

    try {
      await sendMessage({
        receiverId: otherUserId,
        content: optimisticMessage.content,
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-t-lg bg-white"
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div 
              key={msg.id} 
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-3 rounded-lg ${
                isMe ? "bg-slate-900 text-white rounded-br-none" : "bg-slate-100 text-slate-900 rounded-bl-none"
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-slate-300" : "text-slate-500"}`}>
                  {format(new Date(msg.createdAt), "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 border border-t-0 rounded-b-lg bg-slate-50 flex gap-2">
        <Input 
          placeholder="Type a message..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={loading || !content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </>
  );
}
