const STORAGE_BASE = `${process.env.NEXT_PUBLIC_CENTRAL_API_URL || 'http://localhost:8000'}/storage/`;

/**
 * تحويل أي مسار صورة نسبي من الباك إند إلى رابط كامل قابل للعرض.
 * الباك إند يحفظ المسار بشكل: profiles/filename.jpg
 * الدالة ترجع: http://localhost:8000/storage/profiles/filename.jpg
 *
 * @param {string|null} path - المسار النسبي القادم من الباك إند
 * @returns {string|null}
 */
export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${STORAGE_BASE}${path}`;
}
