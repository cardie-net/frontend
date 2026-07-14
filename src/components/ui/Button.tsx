import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2.5 transition-all rounded-md font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  const variantClasses = {
    primary:
      'bg-[var(--color-primary)] dark:bg-[var(--color-primary)] text-[#f7f2e8] border border-[#231d1c] dark:border-[#111111] shadow-[2px_2px_0px_#231d1c] dark:shadow-[2px_2px_0px_#111111] hover:-translate-y-px hover:shadow-[4px_4px_0px_#231d1c] dark:hover:shadow-[4px_4px_0px_#111111] active:translate-y-px active:shadow-none',
    secondary:
      'bg-background text-foreground border border-border-heavy shadow-[1px_1px_0px_var(--color-border-heavy)] hover:-translate-y-px hover:shadow-[2px_2px_0px_var(--color-border-heavy)] active:translate-y-px active:shadow-none',
    danger:
      'bg-error text-error-text border border-border-heavy shadow-[1px_1px_0px_var(--color-border-heavy)] hover:-translate-y-px hover:shadow-[2px_2px_0px_var(--color-border-heavy)] active:translate-y-px active:shadow-none',
    ghost: 'hover:bg-foreground/10 text-foreground',
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
