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
      <div className="rounded-xl bg-gold-50 border border-gold-200 px-5 py-4 text-sm shadow-sm">
        <p className="text-gold-800 font-medium mb-3 leading-relaxed">{message}</p>
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-xl text-sm font-semibold shadow-[0_4px_12px_rgba(8,26,58,0.22)] hover:bg-navy-700 hover:shadow-[0_6px_20px_rgba(8,26,58,0.30)] active:scale-[0.98] transition-all duration-200"
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
    <div className="rounded-xl bg-[#c0392b]/[0.06] border border-[#c0392b]/20 px-4 py-3.5 text-sm text-[#c0392b] space-y-1 shadow-sm flex gap-3">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-2.99L13.74 4a2 2 0 00-3.48 0L3.33 16.01A2 2 0 005.07 19z" />
      </svg>
      <div className="space-y-1">
        <p className="font-semibold">{message}</p>
        {validationErrors && (
          <ul className="list-disc list-inside space-y-0.5 text-[#c0392b]/85 text-xs mt-1">
            {Object.values(validationErrors).flat().map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
