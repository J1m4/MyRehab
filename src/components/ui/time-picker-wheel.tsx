"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WheelPickerProps {
  options: number[];
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function WheelPicker({ options, value, onChange, label }: WheelPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40; // px

  useEffect(() => {
    if (scrollRef.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        scrollRef.current.scrollTop = index * itemHeight;
      }
    }
  }, [value, options]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollTop / itemHeight);
      if (options[index] !== undefined && options[index] !== value) {
        onChange(options[index]);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">{label}</span>}
      <div className="relative h-[120px] w-16 overflow-hidden">
        {/* Selection Highlight */}
        <div className="absolute top-10 left-0 right-0 h-10 border-y border-slate-200 pointer-events-none bg-slate-100/50" />
        
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar py-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {options.map((option) => (
            <div
              key={option}
              className={cn(
                "h-10 flex items-center justify-center snap-center transition-opacity",
                value === option ? "opacity-100 font-bold text-xl" : "opacity-30"
              )}
            >
              {option.toString().padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimePickerWheel({ 
  minutes, 
  seconds, 
  onMinutesChange, 
  onSecondsChange 
}: { 
  minutes: number; 
  seconds: number; 
  onMinutesChange: (m: number) => void; 
  onSecondsChange: (s: number) => void;
}) {
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  const secondOptions = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <WheelPicker 
        options={minuteOptions} 
        value={minutes} 
        onChange={onMinutesChange} 
        label="Min" 
      />
      <span className="text-2xl font-bold mt-4 text-slate-300">:</span>
      <WheelPicker 
        options={secondOptions} 
        value={seconds} 
        onChange={onSecondsChange} 
        label="Sec" 
      />
    </div>
  );
}
