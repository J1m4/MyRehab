"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LogOut, User, Mail, Shield, Camera, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfile, getUserProfile } from "@/app/actions/user";
import { uploadFile } from "@/lib/supabase";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (status !== "authenticated") return;
      const data = await getUserProfile();
      if (data) {
        setProfile({
          ...data,
          birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : "",
        });
      }
      setFetching(false);
    }
    fetchProfile();
  }, [status]);

  if (status === "loading" || (status === "authenticated" && fetching)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!session) return null;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      toast.info("Uploading profile picture...");
      const url = await uploadFile(file, 'profile-pictures');
      await updateProfile({ profilePictureUrl: url });
      setProfile({ ...profile, profilePictureUrl: url });
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const { email, role, name, ...updateData } = profile;
      const result = await updateProfile({
        ...updateData,
        height: profile.height ? parseFloat(profile.height) : undefined,
        weight: profile.weight ? parseFloat(profile.weight) : undefined,
      });

      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Account</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-center gap-4 text-center">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-slate-100 shadow-sm">
              <AvatarImage src={profile?.profilePictureUrl} />
              <AvatarFallback className="text-2xl bg-slate-900 text-white">
                {session.user?.name?.[0] || session.user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="h-6 w-6 text-white" />
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
                disabled={loading}
              />
            </label>
          </div>
          <div>
            <CardTitle className="text-2xl">{session.user?.name || "User"}</CardTitle>
            <CardDescription>{session.user?.email}</CardDescription>
            <Badge variant="outline" className="mt-2">
              {(session.user as any).role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={profile?.firstName || ""} 
                onChange={e => setProfile({...profile, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={profile?.lastName || ""} 
                onChange={e => setProfile({...profile, lastName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel"
              value={profile?.phone || ""} 
              onChange={e => setProfile({...profile, phone: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input 
                id="height" 
                type="number"
                value={profile?.height || ""} 
                onChange={e => setProfile({...profile, height: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input 
                id="weight" 
                type="number"
                value={profile?.weight || ""} 
                onChange={e => setProfile({...profile, weight: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input 
              id="birthday" 
              type="date"
              value={profile?.birthday || ""} 
              onChange={e => setProfile({...profile, birthday: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup 
              value={profile?.gender || ""} 
              onValueChange={v => setProfile({...profile, gender: v})}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="M" id="m" />
                <Label htmlFor="m">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="F" id="f" />
                <Label htmlFor="f">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="City, Country"
                value={profile?.location || ""} 
                onChange={e => setProfile({...profile, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input 
                id="timezone" 
                placeholder="UTC-5"
                value={profile?.timezone || ""} 
                onChange={e => setProfile({...profile, timezone: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "default" ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-900",
      className
    )}>
      {children}
    </span>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
