'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Spinner from '@/components/common/Spinner';

function MobileTopBar({ onMenuOpen }) {
  return (
    <div className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-[#e4e9f2] sticky top-0 z-30">
      <button
        onClick={onMenuOpen}
        className="p-2 rounded-lg hover:bg-navy-50 text-slate-600 hover:text-navy-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="mr-3 font-bold text-navy-900 text-sm">لوحة المدير</span>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login');
      else if (!isSuperAdmin) router.replace('/dashboard');
    }
  }, [user, loading, isSuperAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) return null;

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileTopBar onMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
