"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Users, Plus, MessageSquare, Dumbbell, Search } from "lucide-react";

export default function TherapistDashboard({ clients }: { clients: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter((relation) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${relation.client.firstName || ""} ${relation.client.lastName || ""}`.toLowerCase();
    const email = relation.client.email.toLowerCase();
    const name = (relation.client.name || "").toLowerCase();

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      name.includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Coach Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/therapist/invite">
            <Plus className="mr-2 h-4 w-4" /> Invite Athlete
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search athletes..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No athletes found matching "{searchQuery}"
          </div>
        ) : (
          filteredClients.map((relation) => (
            <Card key={relation.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>{relation.client.name || `${relation.client.firstName || ""} ${relation.client.lastName || ""}`.trim() || relation.client.email}</CardTitle>
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
