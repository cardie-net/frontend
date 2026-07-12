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
    'flex items-center gap-2.5 bg-[#7e6b69] dark:bg-white text-background transition-all rounded-md px-4 py-1 text-base font-bold border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] active:translate-y-px active:shadow-none';

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
