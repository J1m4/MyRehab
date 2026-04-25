"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Play, Upload, Check } from "lucide-react";
import { submitExerciseResult } from "@/app/actions/exercise";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ExerciseItem({ exercise }: { exercise: any }) {
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState(exercise.result?.feedback || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isCompleted = exercise.status === "COMPLETED";

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = exercise.youtubeUrl ? getYoutubeId(exercise.youtubeUrl) : null;

  async function handleSubmit() {
    setLoading(true);
    try {
      const result = await submitExerciseResult({
        exerciseId: exercise.id,
        feedback,
        // mediaUrl: placeholder for now
      });

      if (result.success) {
        toast.success("Result submitted!");
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={isCompleted ? "border-green-200" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{exercise.name}</CardTitle>
        {isCompleted ? (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Check className="mr-1 h-3 w-3" /> Completed
          </Badge>
        ) : (
          <Badge variant="outline">Pending</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {videoId ? (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-slate-100">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={exercise.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : exercise.youtubeUrl && (
          <Button asChild variant="outline" className="w-full">
            <a href={exercise.youtubeUrl} target="_blank" rel="noopener noreferrer">
              <Play className="mr-2 h-4 w-4" /> Watch Video
            </a>
          </Button>
        )}

        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md italic">
          {exercise.instructions}
        </div>

        {exercise.result && !showForm && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-slate-400">My Feedback</h4>
            <p className="text-sm">{exercise.result.feedback}</p>
            {exercise.result.aiInsight && (
              <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
                <strong>AI Insight:</strong> {exercise.result.aiInsight}
              </div>
            )}
          </div>
        )}

        {!isCompleted && !showForm && (
          <Button className="w-full" onClick={() => setShowForm(true)}>
            Update Results
          </Button>
        )}

        {showForm && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">How did it feel?</h4>
              <Textarea 
                placeholder="e.g., Felt a bit of pain in my right knee during the last set..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Upload Image/Video (Optional)</h4>
              <div className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-xs text-slate-500 mt-1">Tap to upload</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Submit + Mark Done"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
