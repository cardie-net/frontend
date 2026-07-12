import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface NavbarButtonProps {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function NavbarButton({ href, onClick, icon: Icon, children }: NavbarButtonProps) {
  const content = (
    <>
      <Icon size={20} />
      <span>{children}</span>
    </>
  );

  const className =
    'flex items-center gap-2.5 bg-[#7e6b69] dark:bg-white text-background hover:opacity-90 transition-opacity rounded-md px-4 py-1 text-base font-bold';

  if (href) {
    return (
      <Link href={href} className={className}>
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
