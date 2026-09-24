export function formatDate(value?: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function toDateInput(value?: string | null) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export type DeadlineState = 'open' | 'closing-soon' | 'closed';

export function deadlineState(deadline?: string | null): DeadlineState | null {
  if (!deadline) return null;
  const end = new Date(deadline);
  if (Number.isNaN(end.getTime())) return null;
  end.setHours(23, 59, 59, 999);
  const msLeft = end.getTime() - Date.now();
  if (msLeft < 0) return 'closed';
  if (msLeft <= 7 * 24 * 60 * 60 * 1000) return 'closing-soon';
  return 'open';
}

export function titleCase(value: string) {
  return value.replace(/(^|[-\s])(\w)/g, (_, sep: string, ch: string) => `${sep === '-' ? ' ' : sep}${ch.toUpperCase()}`);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
