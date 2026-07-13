/**
 * A horizontal divider with centered text label, used to visually
 * separate different sign-in methods (e.g., "or").
 */
export default function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-[#5f4f4e]/30 dark:bg-[#d4d4d4]/30" />
      <span className="text-sm font-bold text-foreground/60 uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-[#5f4f4e]/30 dark:bg-[#d4d4d4]/30" />
    </div>
  );
}
