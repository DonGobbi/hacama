function cell(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const csv = [headers, ...rows].map((r) => r.map(cell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
