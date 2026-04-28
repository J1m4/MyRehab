"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserMinus, Loader2 } from "lucide-react";
import { removeClient } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RemoveAthleteButton({ 
  clientId, 
  clientName 
}: { 
  clientId: string; 
  clientName: string; 
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    setLoading(true);
    try {
      const result = await removeClient(clientId);
      if (result.success) {
        toast.success(`Removed ${clientName} from your athlete list`);
        setOpen(false);
        router.push("/dashboard/therapist");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove athlete");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
          <UserMinus className="mr-2 h-4 w-4" /> Remove Athlete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Athlete</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{clientName}</strong>? 
            This will disconnect them from your coaching dashboard, but their account will not be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleRemove} 
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Remove Athlete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
