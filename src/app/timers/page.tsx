"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TimersPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <TimerIcon className="h-6 w-6 text-slate-700" />
        <h1 className="text-2xl font-bold">Timers</h1>
      </div>

      <Tabs defaultValue="stopwatch" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
          <TabsTrigger value="countdown">Countdown</TabsTrigger>
          <TabsTrigger value="interval">Interval</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stopwatch" className="mt-4">
          <Stopwatch />
        </TabsContent>

        <TabsContent value="countdown" className="mt-4">
          <Countdown />
        </TabsContent>

        <TabsContent value="interval" className="mt-4">
          <IntervalTimer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((time) => time + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="flex flex-col items-center p-8 space-y-6">
      <div className="text-6xl font-mono font-bold tabular-nums">
        {formatTime(time)}
      </div>
      <div className="flex gap-4">
        <Button 
          variant={isActive ? "outline" : "default"} 
          size="lg" 
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => { setTime(0); setIsActive(false); }}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </Card>
  );
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(1);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = () => {
    if (!isActive && timeLeft === 0) {
      setTimeLeft(inputMinutes * 60);
    }
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="flex flex-col items-center p-8 space-y-6">
      {isActive || timeLeft > 0 ? (
        <div className="text-6xl font-mono font-bold tabular-nums">
          {formatTime(timeLeft)}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            value={inputMinutes} 
            onChange={(e) => setInputMinutes(Number(e.target.value))}
            className="w-20 text-center text-xl"
          />
          <span className="text-xl font-medium">Minutes</span>
        </div>
      )}
      
      <div className="flex gap-4">
        <Button 
          variant={isActive ? "outline" : "default"} 
          size="lg" 
          onClick={isActive ? () => setIsActive(false) : startTimer}
        >
          {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isActive ? "Pause" : "Start"}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => { setTimeLeft(0); setIsActive(false); }}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
    </Card>
  );
}

function IntervalTimer() {
  const [sets, setSets] = useState(3);
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(10);
  
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<"WORK" | "REST" | "READY">("READY");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (phase === "WORK") {
        if (currentSet < sets) {
          setPhase("REST");
          setTimeLeft(restTime);
        } else {
          setIsActive(false);
          setPhase("READY");
        }
      } else if (phase === "REST") {
        setCurrentSet(s => s + 1);
        setPhase("WORK");
        setTimeLeft(workTime);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase, currentSet, sets, restTime, workTime]);

  const start = () => {
    if (phase === "READY") {
      setPhase("WORK");
      setTimeLeft(workTime);
      setCurrentSet(1);
    }
    setIsActive(true);
  };

  return (
    <Card className="p-8">
      {isActive || phase !== "READY" ? (
        <div className="flex flex-col items-center space-y-4">
          <Badge variant={phase === "WORK" ? "default" : "secondary"} className="text-xl px-4 py-1">
            {phase}
          </Badge>
          <div className="text-6xl font-mono font-bold">
            {timeLeft}s
          </div>
          <div className="text-lg font-medium">
            Set {currentSet} of {sets}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setIsActive(!isActive)}>
              {isActive ? "Pause" : "Resume"}
            </Button>
            <Button variant="ghost" onClick={() => { setIsActive(false); setPhase("READY"); }}>
              Stop
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-xs mx-auto">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label>Sets</Label>
            <Input type="number" value={sets} onChange={e => setSets(Number(e.target.value))} />
            <Label>Work (sec)</Label>
            <Input type="number" value={workTime} onChange={e => setWorkTime(Number(e.target.value))} />
            <Label>Rest (sec)</Label>
            <Input type="number" value={restTime} onChange={e => setRestTime(Number(e.target.value))} />
          </div>
          <Button className="w-full" onClick={start}>Start Interval</Button>
        </div>
      )}
    </Card>
  );
}
