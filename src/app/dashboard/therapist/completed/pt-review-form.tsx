"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { savePTFeedback } from "@/app/actions/exercise";

export default function PTReviewForm({ 
  resultId, 
  initialNotes, 
  initialConcerns 
}: { 
  resultId: string;
  initialNotes: string;
  initialConcerns: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [concerns, setConcerns] = useState(initialConcerns);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const result = await savePTFeedback({
        resultId,
        notes,
        concerns,
      });

      if (result.success) {
        toast.success("Feedback saved successfully");
      } else {
        toast.error(result.error || "Failed to save feedback");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`notes-${resultId}`} className="text-xs">Clinical Notes</Label>
        <Textarea 
          id={`notes-${resultId}`}
          placeholder="Clinical observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`concerns-${resultId}`} className="text-xs">Flags / Concerns</Label>
        <Textarea 
          id={`concerns-${resultId}`}
          placeholder="Any areas of concern..."
          value={concerns}
          onChange={(e) => setConcerns(e.target.value)}
          className="text-sm border-orange-200 focus-visible:ring-orange-200"
        />
      </div>
      <Button 
        onClick={handleSave} 
        disabled={loading} 
        className="w-full"
      >
        {loading ? "Saving..." : "Save Feedback"}
      </Button>
    </div>
  );
}
