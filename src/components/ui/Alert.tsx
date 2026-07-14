import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'error' | 'warning' | 'info' | 'success';
  className?: string;
}

export function Alert({ children, variant = 'error', className = '' }: AlertProps) {
  const variantClasses = {
    error: 'bg-error text-error-text',
    warning: 'bg-warning text-warning-text',
    info: 'bg-info text-info-text',
    success: 'bg-success text-success-text',
  };

  return (
    <div
      className={`p-3 rounded-md flex items-start gap-2 text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
