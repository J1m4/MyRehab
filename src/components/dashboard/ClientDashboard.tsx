"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClientCalendarView from "./ClientCalendarView";

export default function ClientDashboard({ workouts }: { workouts: any[] }) {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-slate-500">Track your recovery progress on the calendar</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Recovery Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientCalendarView workouts={workouts} clientId="" />
        </CardContent>
      </Card>
    </div>
  );
}
