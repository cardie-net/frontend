'use client';

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  activeBgClass?: string;
  activeTextClass?: string;
}

interface TabbedLayoutProps {
  tabs: TabItem[];
  defaultTabId?: string;
  title?: string;
}

export function TabbedLayout({ tabs, defaultTabId, title }: TabbedLayoutProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);
  const [isMobileViewContent, setIsMobileViewContent] = useState(false);
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-full flex-grow min-h-[80vh]">
      {title && (
        <h1 className="text-4xl font-black mb-8 text-foreground uppercase tracking-tight">
          {title}
        </h1>
      )}
      <div className="flex-grow bg-background text-foreground rounded-2xl border-2 border-border-heavy shadow-[8px_8px_0px_var(--color-border-heavy)] overflow-hidden flex flex-col min-h-0">
        <div
          className={`flex-grow flex flex-row w-[200%] md:w-full transition-transform duration-300 ease-out md:p-2 md:gap-2 ${isMobileViewContent ? '-translate-x-1/2 md:translate-x-0' : 'translate-x-0'} min-h-0`}
        >
          {/* Left sidebar - Tabs */}
          <div className="w-1/2 md:w-72 md:rounded-2xl bg-foreground/5 p-4 md:p-6 flex flex-col gap-3 shrink-0 overflow-y-auto">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;

              const isHovered = hoveredTabId === tab.id;

              const activeClassesMobile = `border-foreground shadow-[2px_2px_0px_var(--foreground)] translate-x-[-1px] translate-y-[-1px] ${tab.activeBgClass || 'bg-foreground'} ${tab.activeTextClass || 'text-background'}`;
              const inactiveClassesDesktop = `md:border-transparent md:bg-transparent md:text-foreground md:shadow-none md:translate-x-0 md:translate-y-0`;
              const showAsInactiveOnDesktop = !isActive && !isHovered;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setIsMobileViewContent(true);
                  }}
                  onMouseEnter={() => setHoveredTabId(tab.id)}
                  onMouseLeave={() => setHoveredTabId(null)}
                  onFocus={() => setHoveredTabId(tab.id)}
                  onBlur={() => setHoveredTabId(null)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left font-bold ${activeClassesMobile} ${showAsInactiveOnDesktop ? inactiveClassesDesktop : ''}`}
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  <span className="text-lg">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right side - Content */}
          <div className="w-1/2 md:w-auto flex-grow flex flex-col bg-foreground text-background md:rounded-2xl overflow-hidden">
            {/* Mobile Back Button */}
            <div className="md:hidden border-b-2 border-background p-4 flex items-center shrink-0">
              <button
                onClick={() => setIsMobileViewContent(false)}
                className="flex items-center gap-2 font-bold text-background hover:bg-background/10 px-4 py-2 rounded-xl transition-all duration-200 border border-transparent hover:border-background hover:shadow-[2px_2px_0px_currentColor] hover:-translate-y-[1px] hover:-translate-x-[1px]"
              >
                <ChevronLeft size={20} />
                Back to Menu
              </button>
            </div>
            <div className="p-6 md:p-8 flex-grow overflow-y-auto">{activeTab?.content}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
