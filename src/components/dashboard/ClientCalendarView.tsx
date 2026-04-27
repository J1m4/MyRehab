"use client";

import { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  isPast,
  startOfDay
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Workout {
  id: string;
  title: string;
  scheduledFor: Date | string;
  status: string;
  exercises: {
    id: string;
    name: string;
  }[];
}

export default function ClientCalendarView({ 
  workouts,
  isTherapist = false,
  clientId
}: { 
  workouts: Workout[];
  clientId?: string;
  isTherapist?: boolean;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getWorkoutsForDay = (day: Date) => {
    return workouts.filter(w => isSameDay(new Date(w.scheduledFor), day));
  };

  const selectedDayWorkouts = getWorkoutsForDay(selectedDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">
            {format(currentMonth, "MMMM yyyy")}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-slate-200 border rounded-lg overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-500">
                {dayName}
              </div>
            ))}
            {calendarDays.map((day) => {
              const dayWorkouts = getWorkoutsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[80px] p-2 cursor-pointer transition-colors relative",
                    isCurrentMonth ? "bg-white" : "bg-slate-50 text-slate-400",
                    isSelected ? "ring-2 ring-inset ring-slate-900 z-10" : "hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isToday(day) && "bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-full"
                  )}>
                    {format(day, "d")}
                  </span>
                  
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayWorkouts.map((w) => (
                      <div 
                        key={w.id} 
                        className={cn(
                          "w-2 h-2 rounded-full",
                          w.status === "COMPLETED" ? "bg-green-500" : 
                          (isPast(startOfDay(new Date(w.scheduledFor))) && !isToday(new Date(w.scheduledFor))) ? "bg-red-500" : "bg-orange-500"
                        )}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Upcoming</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Missed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Activities for {format(selectedDate, "PPPP")}
          </h3>
          {isTherapist && clientId && (
            <Button asChild size="sm">
              <Link href={`/dashboard/therapist/client/${clientId}/workout/new?date=${format(selectedDate, "yyyy-MM-dd")}`}>
                <Plus className="mr-2 h-4 w-4" /> Add Workout
              </Link>
            </Button>
          )}
        </div>

        {selectedDayWorkouts.length === 0 ? (
          <Card className="py-8 bg-slate-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
              <Clock className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No activities scheduled for this day.</p>
            </CardContent>
          </Card>
        ) : (
          selectedDayWorkouts.map((workout) => (
            <Card key={workout.id} className="hover:border-slate-300 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{workout.title}</CardTitle>
                  <CardDescription>
                    {workout.exercises.length} exercises
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {workout.status === "COMPLETED" ? (
                    <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Completed
                    </div>
                  ) : (isPast(startOfDay(new Date(workout.scheduledFor))) && !isToday(new Date(workout.scheduledFor))) ? (
                    <div className="flex items-center text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded-full">
                      <AlertCircle className="mr-1 h-4 w-4" /> Missed
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-600 text-sm font-medium bg-orange-50 px-2 py-1 rounded-full">
                      <Clock className="mr-1 h-4 w-4" /> Upcoming
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={isTherapist ? `/dashboard/therapist/workout/${workout.id}` : `/workout/${workout.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
