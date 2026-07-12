'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLinks({
  className = '',
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Decks', href: '/decks' },
  ];

  return (
    <div className={`flex ${className}`}>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            className={`font-semibold px-4 py-2 transition-colors ${
              isActive
                ? 'text-primary border-b-2 border-primary'
                : 'text-foreground hover:text-primary'
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
}
