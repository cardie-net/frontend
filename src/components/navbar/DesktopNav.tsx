import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { AccountActions } from './AccountActions';

interface DesktopNavProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function DesktopNav({ isLoggedIn, onLogout }: DesktopNavProps) {
  return (
    <div className="hidden md:flex items-center justify-between w-full h-16 px-8 bg-background border-b border-accent/20 shadow-sm">
      <div className="flex items-center gap-8">
        <Logo />
        <NavLinks className="gap-2" />
      </div>
      <AccountActions isLoggedIn={isLoggedIn} onLogout={onLogout} />
    </div>
  );
}
