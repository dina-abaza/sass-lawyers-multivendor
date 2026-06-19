import Link from 'next/link';

export default function ErrorMessage({ error }) {
  if (!error) return null;

  const errorCode = error?.response?.data?.error;
  const message =
    error?.response?.data?.message ||
    (errorCode !== 'subscription_expired' ? errorCode : null) ||
    error?.message ||
    'حدث خطأ غير متوقع';

  if (errorCode === 'subscription_expired') {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-4 text-sm">
        <p className="text-amber-800 mb-3">{message}</p>
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          اختر باقتك الآن
        </Link>
      </div>
    );
  }

  const validationErrors = error?.response?.data?.errors;

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 space-y-1">
      <p className="font-medium">{message}</p>
      {validationErrors && (
        <ul className="list-disc list-inside space-y-0.5 text-red-600 text-xs mt-1">
          {Object.values(validationErrors).flat().map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
