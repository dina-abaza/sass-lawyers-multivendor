'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Spinner from '@/components/common/Spinner';

const ROUTE_PERMISSIONS = {
  '/dashboard': null, '/profile': null, '/notifications': null, '/attendance': null,
  '/subscriptions': null, '/settings/app-info': null,
  '/case-statuses': 'view_case_statuses',
  '/settings/work-locations': 'edit_settings',
  '/finance/accounts': 'access_accounting_list',
  '/settings/invoice-settings': 'invoices_settings',
  '/settings/roles': 'view_user_roles',
  '/departments': 'view_employees', '/customers': 'view_customers',
  '/employees/messages': 'access_hr_list', '/employees': 'view_employees',
  '/wakalas': 'view_wakalas', '/contracts': null,
  '/consultations': 'view_consultations', '/cases': 'view_cases',
  '/sessions': 'view_sessions', '/hr/attendance': 'access_hr_list',
  '/hr/missions': 'access_hr_list', '/hr/vacations': 'access_hr_list',
  '/hr/deductions': 'access_hr_list', '/tasks': 'view_tasks',
  '/documents/legal': 'view_documents', '/documents/general': 'view_global_docs',
  '/finance/receipts': 'view_vouchers', '/finance/payment-vouchers': 'view_vouchers',
  '/finance/invoices': 'view_invoices', '/finance/contract-invoices': 'view_invoices',
  '/finance/consulting-invoices': 'view_invoices', '/finance/salary-sheets': 'access_hr_list',
  '/finance/journal-entries': 'access_accounting_list',
  '/finance/trial-balance': 'access_accounting_list',
  '/finance/account-statement': 'access_accounting_list',
  '/reports/lawyer': 'view_lawyer_reports',
};

function getRequiredPermission(pathname) {
  if (ROUTE_PERMISSIONS[pathname] !== undefined) return ROUTE_PERMISSIONS[pathname];
  const match = Object.keys(ROUTE_PERMISSIONS)
    .filter(r => r !== '/dashboard' && pathname.startsWith(r))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_PERMISSIONS[match] : null;
}

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">غير مصرح بالوصول</h2>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        ليس لديك صلاحية لعرض هذه الصفحة. تواصل مع مدير المكتب لمنحك الصلاحية المطلوبة.
      </p>
    </div>
  );
}

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
      <span className="mr-3 font-bold text-navy-900 text-sm">نظام المحاماة</span>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { user, loading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

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

  if (!user) return null;

  const requiredPermission = getRequiredPermission(pathname);
  const allowed = hasPermission(requiredPermission);

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileTopBar onMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto">
          {allowed ? children : <UnauthorizedPage />}
        </main>
      </div>
    </div>
  );
}
