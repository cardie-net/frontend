'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  backdropClassName?: string;
}

export function Popup({ isOpen, onClose, title, children, backdropClassName = '' }: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      // Use a timeout to ensure any event that caused the popup to open
      // doesn't immediately trigger the mousedown listener and close it.
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Prevent scrolling when popup is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4 ${backdropClassName}`}
    >
      <div
        ref={popupRef}
        className="relative w-full max-w-md bg-background text-foreground rounded-xl border-2 border-foreground shadow-[8px_8px_0px_currentColor] p-6 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-md border-2 border-foreground hover:bg-foreground/10 transition-colors focus:outline-none shadow-[2px_2px_0px_currentColor] hover:translate-y-px hover:shadow-[1px_1px_0px_currentColor] active:translate-y-[2px] active:shadow-none"
            aria-label="Close popup"
          >
            <X size={18} />
          </button>
        </div>
        <div className="text-base text-foreground/90">{children}</div>
      </div>
    </div>
  );
}
