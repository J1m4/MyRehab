"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { inviteClient } from "@/app/actions/invite-client";
import { useRouter } from "next/navigation";

export default function InviteClientPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await inviteClient(email);
      if (result.success) {
        setInviteLink(result.inviteLink || null);
        toast.success(result.emailSent ? "Invite sent via email!" : "Invite link generated!");
      } else {
        toast.error(result.error || "Failed to generate invite");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (inviteLink) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invite Generated</CardTitle>
            <CardDescription>
              Share this link with your athlete so they can sign up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-slate-100 rounded break-all text-sm font-mono">
              {inviteLink}
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                toast.success("Link copied to clipboard!");
              }}
            >
              Copy Link
            </Button>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/therapist")}>
              Back to Coach Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invite an Athlete</CardTitle>
          <CardDescription>
            Enter the athlete's email address to send them an invitation link to MyCoach.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Athlete Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="athlete@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Invite"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
