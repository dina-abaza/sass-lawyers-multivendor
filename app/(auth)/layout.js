import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-navy-700/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-navy-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-navy-700 rounded-2xl flex items-center justify-center shadow-lg shadow-navy-700/25">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-navy-900">نظام إدارة المحاماة</h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-navy-900/5 border border-[#e4e9f2] p-8">
          {children}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} نظام المحاماة — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
