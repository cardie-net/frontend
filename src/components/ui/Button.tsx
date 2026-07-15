import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
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
      'bg-primary text-background border border-primary-dark shadow-primary hover:-translate-y-px hover:shadow-primary-hover active:translate-y-px active:shadow-none',
    secondary:
      'bg-background text-foreground border border-secondary-dark shadow-secondary hover:-translate-y-px hover:shadow-secondary-hover active:translate-y-px active:shadow-none',
    accent:
      'bg-accent text-background border border-accent-dark shadow-accent hover:-translate-y-px hover:shadow-accent-hover active:translate-y-px active:shadow-none',
    danger:
      'bg-error text-error-text border border-border-heavy shadow-[2px_2px_0px_var(--color-error)] hover:-translate-y-px hover:shadow-[4px_4px_0px_var(--color-error)] active:translate-y-px active:shadow-none',
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
