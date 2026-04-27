"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { sendMessage, sendImageMessage } from "@/app/actions/message";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { uploadFile } from "@/lib/supabase";
import { toast } from "sonner";

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!content.trim() && !selectedImage) || loading) return;

    setLoading(true);
    
    // Optimistic UI update (simplified for images)
    const optimisticMessage = {
      id: "temp-" + Date.now(),
      senderId: currentUserId,
      receiverId: otherUserId,
      content,
      imageUrl: imagePreview,
      createdAt: new Date(),
    };

    setMessages([...messages, optimisticMessage]);
    const currentContent = content;
    const currentImage = selectedImage;
    
    setContent("");
    clearImage();

    try {
      if (currentImage) {
        const formData = new FormData();
        formData.append("file", currentImage);
        formData.append("receiverId", otherUserId);
        formData.append("content", currentContent);
        
        const result = await sendImageMessage(formData);
        if (!result.success) toast.error(result.error || "Failed to send image");
      } else {
        await sendMessage({
          receiverId: otherUserId,
          content: currentContent,
        });
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to send message");
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[500px]">
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
                {msg.imageUrl && (
                  <div className="mb-2 rounded-md overflow-hidden bg-slate-200 min-w-[200px]">
                    <img 
                      src={msg.imageUrl} 
                      alt="Shared image" 
                      className="w-full h-auto max-h-[300px] object-contain"
                    />
                  </div>
                )}
                {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                <p className={`text-[10px] mt-1 ${isMe ? "text-slate-300" : "text-slate-500"}`}>
                  {format(new Date(msg.createdAt), "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {imagePreview && (
        <div className="p-2 border-x bg-slate-50 relative flex items-center gap-2">
          <div className="relative w-16 h-16 rounded overflow-hidden border bg-white">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={clearImage}
              className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <span className="text-xs text-slate-500 italic">Image attached</span>
        </div>
      )}

      <form onSubmit={handleSend} className="p-4 border border-t-0 rounded-b-lg bg-slate-50 flex gap-2">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <ImageIcon className="h-5 w-5 text-slate-500" />
        </Button>
        <Input 
          placeholder="Type a message..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={loading || (!content.trim() && !selectedImage)}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
