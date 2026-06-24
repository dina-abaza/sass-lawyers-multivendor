const STORAGE_BASE = `${process.env.NEXT_PUBLIC_CENTRAL_API_URL || 'http://localhost:8000'}/storage/`;

export function toOptions(raw, labelFn) {
  const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
  if (!list.length) return [];
  if (labelFn) return list.map((item) => ({ value: item.id, label: labelFn(item) }));
  return list.map((item) => ({ value: item.id, label: item.name ?? String(item.id) }));
}

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${STORAGE_BASE}${path}`;
}
