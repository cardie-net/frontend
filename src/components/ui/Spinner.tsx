import React from 'react';

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mb-4"></div>
      <p className="text-foreground/80 font-medium animate-pulse">Loading...</p>
    </div>
  );
}
