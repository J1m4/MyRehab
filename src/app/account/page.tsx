"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Mail, Shield } from "lucide-react";

export default function AccountPage() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Account</h1>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">
              {session.user?.name?.[0] || session.user?.email?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{session.user?.name || "User"}</CardTitle>
            <CardDescription>{session.user?.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Shield className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Role</p>
              <p className="text-sm font-medium">{(session.user as any).role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Mail className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
              <p className="text-sm font-medium">{session.user?.email}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" disabled>
            Notification Settings (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            Privacy Policy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
