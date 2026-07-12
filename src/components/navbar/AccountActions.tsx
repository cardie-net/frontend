import Link from 'next/link';

interface AccountActionsProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  isMobile?: boolean;
}

export function AccountActions({ isLoggedIn, onLogout, isMobile = false }: AccountActionsProps) {
  if (isLoggedIn) {
    return (
      <button
        onClick={onLogout}
        className={`font-semibold transition-colors ${
          isMobile
            ? 'w-full text-left py-3 text-secondary hover:text-foreground'
            : 'px-5 py-2 rounded-lg bg-secondary text-background hover:bg-secondary/90'
        }`}
      >
        Log out
      </button>
    );
  }

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-4'}`}>
      <Link
        href="/login"
        className={`font-semibold transition-colors ${
          isMobile
            ? 'py-2 text-foreground hover:text-primary'
            : 'text-foreground hover:text-primary'
        }`}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className={`font-semibold transition-colors ${
          isMobile
            ? 'py-3 text-center rounded-lg bg-primary text-background hover:bg-primary/90 mt-2'
            : 'px-5 py-2 rounded-lg bg-primary text-background hover:bg-primary/90 shadow-sm'
        }`}
      >
        Sign up
      </Link>
    </div>
  );
}
