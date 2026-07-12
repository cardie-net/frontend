import Link from 'next/link';

export function Logo() {
  return (
    <Link
      href="/"
      className="text-2xl font-extrabold tracking-tight text-primary hover:text-primary/80 transition-colors"
    >
      Cardie
    </Link>
  );
}
