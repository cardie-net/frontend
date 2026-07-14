/**
 * A horizontal divider with centered text label, used to visually
 * separate different sign-in methods (e.g., "or").
 */
export default function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-current opacity-30" />
      <span className="text-sm font-bold opacity-60 uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-current opacity-30" />
    </div>
  );
}
