import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface NavbarButtonProps {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  children?: React.ReactNode;
  hideTextOnMobile?: boolean;
  className?: string;
}

export function NavbarButton({
  href,
  onClick,
  icon: Icon,
  children,
  hideTextOnMobile,
  className: customClassName,
}: NavbarButtonProps) {
  const content = (
    <>
      <Icon size={20} className="shrink-0" />
      {children && <span className={hideTextOnMobile ? 'hidden sm:inline' : ''}>{children}</span>}
    </>
  );

  const basePadding = children ? (hideTextOnMobile ? 'px-2 sm:px-4' : 'px-4') : 'px-2';

  const className = `flex items-center gap-2.5 bg-nav-btn-bg text-nav-btn-text transition-all rounded-md ${basePadding} py-1 text-base font-bold border border-nav-btn-border shadow-[1px_1px_0px_var(--nav-btn-border)] hover:-translate-y-px hover:shadow-[2px_2px_0px_var(--nav-btn-border)] active:translate-y-px active:shadow-none whitespace-nowrap shrink-0 ${customClassName || ''}`;

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}
