'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [packagesOpen, setPackagesOpen] = useState(
    pathname.startsWith('/admin/subscriptions')
  );

  function active(href) {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard';
    return pathname === href;
  }

  const linkCls = (href) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active(href)
        ? 'bg-purple-50 text-purple-700'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <aside className="w-64 min-h-screen bg-white border-l border-gray-200 flex flex-col overflow-y-auto shadow-sm">
      {/* Brand */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-100 bg-gradient-to-l from-purple-600 to-indigo-600">
        <div className="text-center">
          <p className="font-bold text-white text-sm">نظام إدارة المحامين</p>
          <p className="text-purple-200 text-xs mt-0.5">لوحة تحكم المدير</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {/* الرئيسية */}
        <Link href="/admin/dashboard" className={linkCls('/admin/dashboard')}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          الرئيسية
        </Link>

        {/* تسجيل الحضور والانصراف */}
        <Link href="/admin/attendance" className={linkCls('/admin/attendance')}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          تسجيل الحضور والانصراف
        </Link>

        {/* النماذج */}
        <Link href="/admin/forms" className={linkCls('/admin/forms')}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          النماذج
        </Link>

        {/* الباقات - Collapsible */}
        <div>
          <button
            onClick={() => setPackagesOpen((o) => !o)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith('/admin/subscriptions')
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="flex-1 text-start">الباقات</span>
            <svg
              className={`w-4 h-4 shrink-0 transition-transform ${packagesOpen ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {packagesOpen && (
            <div className="mt-1 ms-8 space-y-0.5">
              <Link
                href="/admin/subscriptions"
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/subscriptions'
                    ? 'text-purple-700 font-semibold bg-purple-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                قائمة الباقات
              </Link>
              <Link
                href="/admin/subscriptions/create"
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/subscriptions/create'
                    ? 'text-purple-700 font-semibold bg-purple-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                + إضافة باقة
              </Link>
              <Link
                href="/admin/subscriptions/management"
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/admin/subscriptions/management'
                    ? 'text-purple-700 font-semibold bg-purple-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                إدارة الاشتراكات
              </Link>
            </div>
          )}
        </div>

        {/* محامين قيد الانتظار */}
        <Link href="/admin/vendors" className={linkCls('/admin/vendors')}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          محامين قيد الانتظار
        </Link>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'المدير'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
