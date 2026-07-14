import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = false, ...props }: CardProps) {
  const baseClasses = 'bg-background border border-border-heavy rounded-lg p-8';
  const shadowClasses = 'shadow-[4px_4px_0px_var(--color-border-heavy)]';
  const hoverClasses = hoverable
    ? 'hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--color-border-heavy)] transition-all cursor-pointer'
    : '';

  return (
    <div className={`${baseClasses} ${shadowClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
