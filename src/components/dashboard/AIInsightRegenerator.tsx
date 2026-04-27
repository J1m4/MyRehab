"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { regenerateAIInsight } from "@/app/actions/exercise";
import { toast } from "sonner";

export default function AIInsightRegenerator({ resultId }: { resultId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      const result = await regenerateAIInsight(resultId);
      if (result.success) {
        toast.success("Performance Analysis updated!");
      } else {
        toast.error(result.error || "Failed to regenerate analysis");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-7 text-xs flex items-center gap-1.5"
      onClick={handleRegenerate}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          Regenerate Performance Analysis
        </>
      )}
    </Button>
  );
}
