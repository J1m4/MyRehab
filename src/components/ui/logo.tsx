import React from 'react';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-slate-900 text-white p-1 rounded-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M6.7 6.7a8 8 0 0 1 10.6 10.6" />
          <path d="M17.3 17.3a8 8 0 0 1-10.6-10.6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
      <span className="font-bold text-xl tracking-tight hidden sm:inline-block">MyRehab</span>
    </div>
  );
}
