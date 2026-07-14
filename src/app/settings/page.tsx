import React from 'react';
import { User, Palette, Info, Settings, BarChart2, Heart } from 'lucide-react';
import { TabbedLayout, TabItem } from '@/components/TabbedLayout';
import AccountTab from './AccountTab';

export const metadata = {
  title: 'Settings - Cardie',
  description: 'Manage your Cardie settings',
};

export default function SettingsPage() {
  const tabs: TabItem[] = [
    {
      id: 'general',
      label: 'General',
      icon: <Settings size={20} />,
      content: (
        <div className="text-foreground/80">
          <p>General settings will go here.</p>
        </div>
      ),
      activeBgClass: 'bg-general',
      activeTextClass: 'text-general-text',
    },
    {
      id: 'account',
      label: 'Account',
      icon: <User size={20} />,
      content: <AccountTab />,
      activeBgClass: 'bg-success',
      activeTextClass: 'text-success-text',
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette size={20} />,
      content: (
        <div className="text-foreground/80">
          <p>Appearance settings will go here.</p>
        </div>
      ),
      activeBgClass: 'bg-warning',
      activeTextClass: 'text-warning-text',
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: <BarChart2 size={20} />,
      content: (
        <div className="text-foreground/80">
          <p>Statistics and data will go here.</p>
        </div>
      ),
      activeBgClass: 'bg-stats',
      activeTextClass: 'text-stats-text',
    },
    {
      id: 'info',
      label: 'Info',
      icon: <Info size={20} />,
      content: (
        <div className="text-foreground/80">
          <p>Information and about page will go here.</p>
        </div>
      ),
      activeBgClass: 'bg-info',
      activeTextClass: 'text-info-text',
    },
    {
      id: 'donate',
      label: 'Donate',
      icon: <Heart size={20} />,
      content: (
        <div className="text-foreground/80">
          <p>Support the project by donating.</p>
        </div>
      ),
      activeBgClass: 'bg-donate',
      activeTextClass: 'text-donate-text',
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl flex-grow flex items-center justify-center">
      <TabbedLayout tabs={tabs} defaultTabId="general" />
    </div>
  );
}
