'use client';

import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabbedLayoutProps {
  tabs: TabItem[];
  defaultTabId?: string;
  title?: string;
}

export function TabbedLayout({ tabs, defaultTabId, title }: TabbedLayoutProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);

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
        <div className="w-full md:w-72 border-b-2 md:border-b-0 md:border-r-2 border-foreground bg-foreground/5 p-4 md:p-6 flex flex-col gap-3 shrink-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left font-bold ${
                  isActive
                    ? 'border-foreground bg-foreground text-background shadow-[4px_4px_0px_var(--foreground)] translate-x-[-2px] translate-y-[-2px]'
                    : 'border-transparent bg-transparent text-foreground hover:bg-foreground/5 hover:border-foreground hover:shadow-[4px_4px_0px_currentColor] hover:-translate-y-[2px] hover:-translate-x-[2px]'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span className="text-lg">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side - Content */}
        <div className="flex-grow flex flex-col bg-background">
          <div className="p-6 md:p-8 md:pt-10 border-b-2 border-foreground">
            <h2 className="text-3xl font-bold">{activeTab?.label}</h2>
          </div>
          <div className="p-6 md:p-8 flex-grow">{activeTab?.content}</div>
        </div>
      </div>
    </div>
  );
}
