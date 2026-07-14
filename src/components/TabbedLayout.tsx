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

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col min-h-[70vh]">
      {title && (
        <h1 className="text-4xl font-black mb-8 text-foreground uppercase tracking-tight">
          {title}
        </h1>
      )}
      <div className="flex-grow bg-background text-foreground rounded-2xl border-2 border-foreground shadow-[8px_8px_0px_currentColor] flex flex-col md:flex-row overflow-hidden">
        {/* Left sidebar - Tabs */}
        <div
          className={`w-full md:w-72 md:border-r-2 border-foreground bg-foreground/5 p-4 md:p-6 flex-col gap-3 shrink-0 ${isMobileViewContent ? 'hidden md:flex' : 'flex'}`}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;

            const activeClassesMobile = `border-foreground shadow-[4px_4px_0px_var(--foreground)] translate-x-[-2px] translate-y-[-2px] ${tab.activeBgClass || 'bg-foreground'} ${tab.activeTextClass || 'text-background'}`;
            const inactiveClassesDesktop = `md:border-transparent md:bg-transparent md:text-foreground md:hover:bg-foreground/5 md:hover:border-foreground md:hover:shadow-[4px_4px_0px_currentColor] md:hover:-translate-y-[2px] md:hover:-translate-x-[2px] md:shadow-none md:translate-x-0 md:translate-y-0`;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setIsMobileViewContent(true);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left font-bold ${activeClassesMobile} ${!isActive ? inactiveClassesDesktop : ''}`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span className="text-lg">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side - Content */}
        <div
          className={`flex-grow flex-col bg-foreground text-background ${isMobileViewContent ? 'flex' : 'hidden md:flex'}`}
        >
          {/* Mobile Back Button */}
          <div className="md:hidden border-b-2 border-background p-4 flex items-center">
            <button
              onClick={() => setIsMobileViewContent(false)}
              className="flex items-center gap-2 font-bold text-background hover:bg-background/10 px-4 py-2 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-background hover:shadow-[4px_4px_0px_currentColor] hover:-translate-y-[2px] hover:-translate-x-[2px]"
            >
              <ChevronLeft size={20} />
              Back to Menu
            </button>
          </div>
          <div className="p-6 md:p-8 flex-grow">{activeTab?.content}</div>
        </div>
      </div>
    </div>
  );
}
