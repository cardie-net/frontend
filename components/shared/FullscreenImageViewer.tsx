"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullscreenImageViewerProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FullscreenImageViewer({ src, alt, isOpen, onClose }: FullscreenImageViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const lastPointerDown = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset scale and position when opened
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev * 1.5, 10));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => {
      const newScale = Math.max(prev / 1.5, 0.5);
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    lastPointerDown.current = { x: e.clientX, y: e.clientY };
    if (scale > 1) {
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    const dist = Math.hypot(e.clientX - lastPointerDown.current.x, e.clientY - lastPointerDown.current.y);
    if (dist < 5) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200 overflow-hidden"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="absolute top-4 right-4 z-[110] flex items-center gap-2">
        <button 
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          onClick={handleZoomOut}
          title="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button 
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          onClick={handleZoomIn}
          title="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-white/20 mx-1" />
        <button 
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          onClick={(e) => {
             e.stopPropagation();
             onClose();
          }}
          title="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div 
        className="relative w-full h-full flex items-center justify-center"
      >
        <img 
          src={src} 
          alt={alt || ''} 
          draggable={false}
          className={cn(
            "max-h-full max-w-full object-contain drop-shadow-2xl",
            isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : "cursor-pointer",
            !isDragging && "transition-transform duration-200"
          )}
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
        />
      </div>
    </div>,
    document.body
  );
}
