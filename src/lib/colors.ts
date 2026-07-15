export const DECK_COLORS = [
  { id: 'default', label: 'Default' },
  { id: 'success', label: 'Success' },
  { id: 'error', label: 'Error' },
  { id: 'info', label: 'Info' },
  { id: 'warning', label: 'Warning' },
  { id: 'green', label: 'Green' },
  { id: 'purple', label: 'Purple' },
  { id: 'pink', label: 'Pink' },
];

export const getDeckStyle = (color?: string | null) => {
  if (!color || color === 'default') {
    return {
      backgroundColor: 'var(--foreground)',
      color: 'var(--background)',
    };
  }
  return {
    backgroundColor: `var(--${color})`,
    color: `var(--${color}-text)`,
  };
};
