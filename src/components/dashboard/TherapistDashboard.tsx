"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Plus, MessageSquare, Dumbbell } from "lucide-react";

export default function TherapistDashboard({ clients }: { clients: any[] }) {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coach Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/therapist/invite">
            <Plus className="mr-2 h-4 w-4" /> Invite Athlete
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <Card className="col-span-full py-12">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <Users className="h-12 w-12 text-slate-300" />
              <div className="space-y-2">
                <CardTitle>No athletes yet</CardTitle>
                <CardDescription>
                  Invite your first athlete to start assigning training plans.
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/therapist/invite">Invite Athlete</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          clients.map((relation) => (
            <Card key={relation.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>{relation.client.name || relation.client.email}</CardTitle>
                <CardDescription>{relation.client.email}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/dashboard/therapist/client/${relation.client.id}`}>
                    <Dumbbell className="mr-2 h-4 w-4" /> Training
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/messages/${relation.client.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
