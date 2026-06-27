import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f8f9fc 0%, #f0f2f7 50%, #eef1f8 100%)' }}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(8,26,58,0.05)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(212,175,55,0.07)' }} />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'rgba(212,175,55,0.04)' }} />
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)',
                boxShadow: '0 8px 24px rgba(8,26,58,0.25), 0 0 0 1px rgba(212,175,55,0.3)',
              }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: '#D4AF37' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#081A3A' }}>نظام إدارة المحاماة</h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e2e6f0] p-8"
          style={{ boxShadow: '0 8px 32px rgba(8,26,58,0.08)' }}>
          {/* Gold accent bar */}
          <div className="w-full h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #D4AF37, #B8961F)' }} />
          {children}
        </div>

        <p className="text-center text-xs text-[#8896a7] mt-6">
          © {new Date().getFullYear()} نظام المحاماة — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
