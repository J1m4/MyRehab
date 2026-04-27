"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import { createWorkout } from "@/app/actions/workout";
import { toast } from "sonner";

const workoutSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  scheduledFor: z.string(),
  exercises: z.array(z.object({
    name: z.string().min(2, "Exercise name required"),
    instructions: z.string().min(10, "Instructions must be at least 10 characters"),
    youtubeUrl: z.string().url().optional().or(z.literal("")),
  })).min(1, "Add at least one exercise"),
});

type WorkoutFormValues = z.infer<typeof workoutSchema>;

function WorkoutForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const [loading, setLoading] = useState(false);

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      scheduledFor: initialDate,
      exercises: [{ name: "", instructions: "", youtubeUrl: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "exercises",
    control: form.control,
  });

  async function onSubmit(values: WorkoutFormValues) {
    setLoading(true);
    try {
      const result = await createWorkout({
        ...values,
        clientId,
      });

      if (result.success) {
        toast.success("Workout created successfully");
        router.push(`/dashboard/therapist/client/${clientId}`);
      } else {
        toast.error(result.error || "Failed to create workout");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Lower Back Rehab - Phase 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduledFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Dumbbell className="mr-2 h-5 w-5" /> Exercises
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", instructions: "", youtubeUrl: "" })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Exercise
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Exercise #{index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`exercises.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bird-Dog" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`exercises.${index}.instructions`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed instructions on how to perform the exercise safely..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`exercises.${index}.youtubeUrl`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormDescription>Link to a video demonstration</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Workout"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function CreateWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setClientId(p.id));
  }, [params]);

  if (!clientId) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Workout</h1>
        <p className="text-slate-500">Design a workout plan for your client</p>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <WorkoutForm clientId={clientId} />
      </Suspense>
    </div>
  );
}
