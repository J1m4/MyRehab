import React from 'react';
import Image from 'next/image';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8 overflow-hidden rounded-md">
        <Image 
          src="/laneonept.png" 
          alt="Lane One PT Logo" 
          fill 
          className="object-contain"
          priority
          sizes="(max-width: 768px) 32px, 32px"
        />
      </div>
      <span className="font-bold text-xl tracking-tight hidden sm:inline-block">MyRehab</span>
    </div>
  );
}
