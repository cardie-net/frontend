import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface AccountPopupButtonProps {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  asDiv?: boolean;
}

export function AccountPopupButton({
  href,
  onClick,
  icon: Icon,
  children,
  className: customClassName,
  asDiv,
}: AccountPopupButtonProps) {
  const content = (
    <>
      <Icon size={24} />
      <span className="text-sm font-bold">{children}</span>
    </>
  );

  const className = `flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-action-btn-bg text-action-btn-text transition-all border border-action-btn-border shadow-[1px_1px_0px_var(--action-btn-border)] hover:-translate-y-px hover:shadow-[2px_2px_0px_var(--action-btn-border)] active:translate-y-px active:shadow-none ${customClassName || ''}`;

  if (asDiv) {
    return <div className={className}>{content}</div>;
  }

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className} type="button">
      {content}
    </button>
  );
}
