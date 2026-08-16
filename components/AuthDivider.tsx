'use client';

import { useTranslations } from 'next-intl';

export default function AuthDivider({ label }: { label?: string }) {
  const t = useTranslations('Common');
  const displayLabel = label ?? t('or');

  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{displayLabel}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
