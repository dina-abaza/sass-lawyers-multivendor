'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navGroups = [
  // ── المستوى 0: الرئيسية ────────────────────────────────────────────────────
  {
    label: null,
    items: [
      { label: 'الرئيسية', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ],
  },

  // ── المستوى 1: الإعدادات الأساسية ──────────────────────────────────────────
  // لا تعتمد على أي كيان — تُهيَّأ أولاً قبل إدخال أي بيانات
  // حالات القضايا  → مطلوبة قبل: القضايا، الجلسات
  // مواقع العمل    → مطلوبة قبل: الحضور والانصراف
  // شجرة الحسابات → مطلوبة قبل: كل العمليات المالية والقيود
  // إعدادات الفاتورة → مطلوبة قبل: أي فاتورة
  // الأدوار والصلاحيات → تُحدَّد قبل إضافة المستخدمين
  {
    label: 'الإعدادات الأساسية',
    items: [
      { label: 'حالات القضايا', href: '/case-statuses', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
      { label: 'مواقع العمل', href: '/settings/work-locations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
      { label: 'شجرة الحسابات', href: '/finance/accounts', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
      { label: 'إعدادات الفاتورة', href: '/settings/invoice-settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
      { label: 'الأدوار والصلاحيات', href: '/settings/roles', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    ],
  },

  // ── المستوى 2: الكيانات الرئيسية ───────────────────────────────────────────
  // الأقسام   → يجب إنشاؤها قبل الموظفين
  // العملاء   → مطلوبون قبل: القضايا، العقود، الاستشارات، المستندات، سندات القبض/الصرف
  // الموظفون  → يعتمدون على: المستخدم + الأقسام
  // التوكيلات → مستقلة نسبياً
  {
    label: 'الكيانات الرئيسية',
    items: [
      { label: 'الأقسام', href: '/departments', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { label: 'العملاء', href: '/customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { label: 'الموظفون', href: '/employees', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { label: 'التوكيلات', href: '/wakalas', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
    ],
  },

  // ── المستوى 3: القانونية ────────────────────────────────────────────────────
  // العقود      → تعتمد على: العملاء
  // الاستشارات  → تعتمد على: العملاء
  // القضايا     → تعتمد على: العملاء + حالات القضايا + (العقود اختياري)
  // جلسات المحكمة → تعتمد على: القضايا + حالات القضايا
  {
    label: 'القانونية',
    items: [
      { label: 'العقود', href: '/contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { label: 'الاستشارات', href: '/consultations', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
      { label: 'القضايا', href: '/cases', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
      { label: 'أرشيف القضايا', href: '/cases/archive', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
      { label: 'جلسات المحكمة', href: '/sessions', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
  },

  // ── المستوى 4: الموارد البشرية ─────────────────────────────────────────────
  // الحضور والانصراف → يعتمد على: الموظفون + مواقع العمل
  // الإجازات         → تعتمد على: الموظفون
  // الخصومات         → تعتمد على: الحضور + أنواع الخصومات
  {
    label: 'الموارد البشرية',
    items: [
      { label: 'الحضور والانصراف', href: '/hr/attendance', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { label: 'الإجازات', href: '/hr/vacations', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064' },
      { label: 'الخصومات', href: '/hr/deductions', icon: 'M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },

  // ── المستوى 5: المهام والمستندات ───────────────────────────────────────────
  // المهام              → تعتمد على: الموظفون + القضايا
  // المستندات القانونية → تعتمد على: العملاء
  // المستندات العامة    → مستقلة نسبياً
  {
    label: 'المهام والمستندات',
    items: [
      { label: 'المهام', href: '/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { label: 'المستندات القانونية', href: '/documents/legal', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
      { label: 'المستندات العامة', href: '/documents/general', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
  },

  // ── المستوى 6: المالية ─────────────────────────────────────────────────────
  // الفواتير          → تعتمد على: القضايا
  // فواتير العقود     → تعتمد على: العقود
  // فواتير الاستشارات → تعتمد على: الاستشارات
  // سندات القبض/الصرف → تعتمدان على: العملاء
  // كشوف الرواتب     → تعتمد على: الموظفون
  {
    label: 'المالية',
    items: [
      { label: 'سندات القبض', href: '/finance/receipts', icon: 'M5 13l4 4L19 7' },
      { label: 'سندات الصرف', href: '/finance/payment-vouchers', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z' },
      { label: 'الفواتير', href: '/finance/invoices', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
      { label: 'فواتير العقود', href: '/finance/contract-invoices', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
      { label: 'فواتير الاستشارات', href: '/finance/consulting-invoices', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
      { label: 'كشوف الرواتب', href: '/finance/salary-sheets', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },

  // ── المستوى 7: المحاسبة والتقارير ──────────────────────────────────────────
  // القيود اليومية  → تعتمد على: شجرة الحسابات + كل العمليات المالية
  // ميزان المراجعة  → يعتمد على: القيود اليومية + شجرة الحسابات
  {
    label: 'المحاسبة والتقارير',
    items: [
      { label: 'القيود اليومية', href: '/finance/journal-entries', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { label: 'ميزان المراجعة', href: '/finance/trial-balance', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ],
  },

  // ── الإشعارات ───────────────────────────────────────────────────────────────
  {
    label: null,
    items: [
      { label: 'الإشعارات', href: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ],
  },
];


export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  function isActive(href) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  const groups = navGroups;

  return (
    <aside className="w-64 min-h-screen bg-white border-e border-gray-200 flex flex-col overflow-y-auto">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">نظام المحاماة</span>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-4">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg
                    className={`w-4 h-4 flex-shrink-0 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0) || 'م'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
