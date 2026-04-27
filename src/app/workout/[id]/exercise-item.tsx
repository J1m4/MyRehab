"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, Edit2, Upload, Loader2 } from "lucide-react";
import { submitExerciseResult } from "@/app/actions/exercise";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import { uploadFile } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function ExerciseItem({ exercise }: { exercise: any }) {
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState(exercise.result?.feedback || "");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isCompleted = exercise.status === "COMPLETED";
  const embedUrl = getYouTubeEmbedUrl(exercise.youtubeUrl);

  async function handleSubmit() {
    setLoading(true);
    try {
      let mediaUrl = exercise.result?.mediaUrl;

      if (mediaFile) {
        toast.info("Uploading photo...");
        // Sanitize filename: exercise-{exerciseId}-{Date.now()}.jpg
        const fileExt = mediaFile.name.split('.').pop() || 'jpg';
        const fileName = `exercise-${exercise.id}-${Date.now()}.${fileExt}`;
        
        mediaUrl = await uploadFile(mediaFile, 'exercise-media', undefined, fileName);
      }

      const result = await submitExerciseResult({
        exerciseId: exercise.id,
        feedback,
        mediaUrl,
      });

      if (result.success) {
        toast.success(isCompleted ? "Training result updated!" : "Training result submitted!");
        setShowForm(false);
        setMediaFile(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit");
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again with a smaller image or different format.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={isCompleted ? "border-green-200" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{exercise.name}</CardTitle>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Button variant="ghost" size="icon" onClick={() => setShowForm(true)} className="h-8 w-8 text-slate-400">
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {isCompleted ? (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Check className="mr-1 h-3 w-3" /> Done
            </Badge>
          ) : (
            <Badge variant="outline">To Do</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercise.videoUrl ? (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
            <video
              src={exercise.videoUrl}
              className="w-full h-full object-cover"
              controls
            />
          </div>
        ) : embedUrl ? (
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-100 border">
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title={exercise.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : null}

        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md italic">
          {exercise.instructions}
        </div>

        {exercise.result && !showForm && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-slate-400">My Feedback</h4>
            <p className="text-sm">{exercise.result.feedback}</p>
            
            {exercise.result?.mediaUrl && (
              <div className="mt-2 rounded-md overflow-hidden border bg-slate-100">
                <img 
                  src={exercise.result.mediaUrl} 
                  alt="Training proof" 
                  className="w-full max-h-64 object-contain"
                />
              </div>
            )}

            {(exercise.result?.notes || exercise.result?.concerns) && (
              <div className="space-y-2 mt-2 pt-2 border-t">
                {exercise.result?.notes && (
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-900">Coach Notes:</strong> {exercise.result.notes}
                  </div>
                )}
                {exercise.result?.concerns && (
                  <div className="text-xs text-orange-700 bg-orange-50 p-1 rounded">
                    <strong>Flags:</strong> {exercise.result.concerns}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!isCompleted && !showForm && (
          <Button className="w-full" onClick={() => setShowForm(true)}>
            Record Result
          </Button>
        )}

        {showForm && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">How did this session feel?</h4>
              <Textarea 
                placeholder="e.g., Felt strong, heart rate was stable..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Photo (Optional)</h4>
              <input 
                type="file" 
                id={`file-${exercise.id}`}
                className="hidden" 
                accept="image/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              />
              <label 
                htmlFor={`file-${exercise.id}`}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md transition-colors cursor-pointer",
                  mediaFile ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                )}
              >
                <div className="flex flex-col items-center">
                  <Upload className={cn("h-6 w-6", mediaFile ? "text-blue-500" : "text-slate-400")} />
                  <span className={cn("text-xs mt-1", mediaFile ? "text-blue-600 font-medium" : "text-slate-500")}>
                    {mediaFile ? mediaFile.name : "Upload training photo"}
                  </span>
                </div>
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Saving..." : isCompleted ? "Update" : "Complete Training"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
