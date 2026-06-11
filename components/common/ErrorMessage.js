export default function ErrorMessage({ error }) {
  if (!error) return null;
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'حدث خطأ غير متوقع';
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}
