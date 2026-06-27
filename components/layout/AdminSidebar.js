'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar({ mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [subsOpen, setSubsOpen] = useState(pathname.startsWith('/admin/subscriptions'));

  const isActive = (href) =>
    href === '/admin/dashboard' ? pathname === href : pathname === href;

  const linkCls = (href) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive(href)
        ? 'bg-white/10 text-white shadow-sm'
        : 'text-white/60 hover:bg-white/8 hover:text-white/90'
    }`;

  const navLinks = [
    {
      href: '/admin/dashboard',
      label: 'الرئيسية',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      href: '/admin/vendors',
      label: 'مكاتب قيد الانتظار',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      href: '/admin/contacts',
      label: 'رسائل التواصل',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
  ];

  const subsLinks = [
    { href: '/admin/subscriptions', label: 'قائمة الباقات' },
    { href: '/admin/subscriptions/create', label: 'إضافة باقة' },
    { href: '/admin/subscriptions/management', label: 'إدارة الاشتراكات' },
  ];

  const subsActive = pathname.startsWith('/admin/subscriptions');

  const sidebarContent = (
    <aside className="w-64 h-full flex flex-col"
      style={{ background: 'linear-gradient(180deg, #081A3A 0%, #050F22 100%)' }}>

      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ring-2 ring-[#D4AF37]/40"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">لوحة المدير</p>
            <p className="text-xs text-white/40">إدارة المنصة</p>
          </div>
        </div>
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navLinks.map(item => (
          <Link key={item.href} href={item.href} onClick={onMobileClose} className={linkCls(item.href)}>
            {isActive(item.href) && (
              <span className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-[#D4AF37]" />
            )}
            <svg className={`w-4 h-4 flex-shrink-0 ${isActive(item.href) ? 'text-[#D4AF37]' : 'text-white/40'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive(item.href) ? 2.5 : 2} d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}

        {/* Subscriptions accordion */}
        <div>
          <button
            onClick={() => setSubsOpen(o => !o)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              subsActive
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/8 hover:text-white/90'
            }`}
          >
            <svg className={`w-4 h-4 flex-shrink-0 ${subsActive ? 'text-[#D4AF37]' : 'text-white/40'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="flex-1 text-right">الباقات</span>
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${subsOpen ? 'rotate-180' : ''} text-white/30`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            style={{ maxHeight: subsOpen ? `${subsLinks.length * 44}px` : '0px' }}
            className="overflow-hidden transition-all duration-300 ease-in-out"
          >
            <div className="ms-3.5 border-s-2 border-[#D4AF37]/20 ps-2 py-1 space-y-0.5">
              {subsLinks.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={`flex items-center px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                    pathname === item.href
                      ? 'bg-white/12 text-white font-medium'
                      : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                  }`}
                >
                  {pathname === item.href && (
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37] ms-1 me-2 flex-shrink-0" />
                  )}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-white/8">
        <Link href="/admin/profile" onClick={onMobileClose}
          className="flex items-center gap-2.5 mb-2 px-2 py-1.5 rounded-xl hover:bg-white/8 transition-colors group">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#081A3A] font-bold text-sm flex-shrink-0 ring-2 ring-[#D4AF37]/30"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #E8C94A)' }}>
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate group-hover:text-white">{user?.name || 'المدير'}</p>
            <p className="text-xs text-white/30 truncate">{user?.email || ''}</p>
          </div>
        </Link>
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:flex flex-col w-64 min-h-screen flex-shrink-0">
        {sidebarContent}
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-[#081A3A]/60 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative z-50 w-72 h-full shadow-2xl">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
