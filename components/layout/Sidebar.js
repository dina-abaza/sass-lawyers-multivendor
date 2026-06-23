'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { appInfoApi } from '@/lib/api';

const navGroups = [
  {
    label: null,
    items: [
      { label: 'الرئيسية',         href: '/dashboard',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { label: 'حضوري اليوم',      href: '/attendance', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    label: 'الإعدادات الأساسية',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    items: [
      { label: 'إعدادات المكتب',     href: '/settings/app-info',         permission: null,                     icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { label: 'حالات القضايا',      href: '/case-statuses',             permission: 'view_case_statuses',     icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
      { label: 'مواقع العمل',         href: '/settings/work-locations',   permission: 'edit_settings',          icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
      { label: 'شجرة الحسابات',       href: '/finance/accounts',          permission: 'access_accounting_list', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
      { label: 'إعدادات الفاتورة',    href: '/settings/invoice-settings', permission: 'invoices_settings',      icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
      { label: 'الأدوار والصلاحيات', href: '/settings/roles',            permission: 'view_user_roles',        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    ],
  },
  {
    label: 'الكيانات الرئيسية',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    items: [
      { label: 'الأقسام',         href: '/departments',        permission: 'view_employees', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { label: 'العملاء',         href: '/customers',          permission: 'view_customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { label: 'الموظفون',        href: '/employees',          permission: 'view_employees', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { label: 'رسائل الموظفين', href: '/employees/messages', permission: 'access_hr_list', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { label: 'التوكيلات',       href: '/wakalas',            permission: 'view_wakalas',   icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
    ],
  },
  {
    label: 'القانونية',
    icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    items: [
      { label: 'العقود',         href: '/contracts',     icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { label: 'الاستشارات',     href: '/consultations', permission: 'view_consultations', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
      { label: 'القضايا',        href: '/cases',         permission: 'view_cases',         icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
      { label: 'جلسات المحكمة', href: '/sessions',      permission: 'view_sessions',      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
  },
  {
    label: 'الموارد البشرية',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    items: [
      { label: 'الحضور والانصراف', href: '/hr/attendance', permission: 'access_hr_list', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { label: 'المأموريات',        href: '/hr/missions',   permission: 'access_hr_list', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
      { label: 'الإجازات',          href: '/hr/vacations',  permission: 'access_hr_list', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064' },
      { label: 'الخصومات',          href: '/hr/deductions', permission: 'access_hr_list', icon: 'M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    label: 'المهام والمستندات',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    items: [
      { label: 'المهام',               href: '/tasks',            permission: 'view_tasks',      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { label: 'المستندات القانونية', href: '/documents/legal',   permission: 'view_documents',  icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
      { label: 'المستندات العامة',    href: '/documents/general', permission: 'view_global_docs', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
  },
  {
    label: 'المالية',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    items: [
      { label: 'سندات القبض',       href: '/finance/receipts',           permission: 'view_vouchers',          icon: 'M5 13l4 4L19 7' },
      { label: 'سندات الصرف',       href: '/finance/payment-vouchers',   permission: 'view_vouchers',          icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z' },
      { label: 'الفواتير',           href: '/finance/invoices',           permission: 'view_invoices',          icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
      { label: 'فواتير العقود',      href: '/finance/contract-invoices',  permission: 'view_invoices',          icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
      { label: 'فواتير الاستشارات', href: '/finance/consulting-invoices', permission: 'view_invoices',          icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
      { label: 'كشوف الرواتب',      href: '/finance/salary-sheets',      permission: 'access_hr_list',         icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    ],
  },
  {
    label: 'المحاسبة والتقارير',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    items: [
      { label: 'القيود اليومية',  href: '/finance/journal-entries',  permission: 'access_accounting_list', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { label: 'ميزان المراجعة', href: '/finance/trial-balance',     permission: 'access_accounting_list', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { label: 'كشف الحساب',     href: '/finance/account-statement', permission: 'access_accounting_list', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { label: 'تقرير المحامي',  href: '/reports/lawyer',            permission: 'view_lawyer_reports',   icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ],
  },
  {
    label: null,
    items: [
      { label: 'الإشعارات',  href: '/notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      { label: 'الاشتراكات', href: '/subscriptions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    ],
  },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const { logout, user, hasPermission, tenantApi } = useAuth();

  const { data: appInfoRaw } = useQuery({
    queryKey: ['app-info'],
    queryFn: () => appInfoApi.get(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
    staleTime: 1000 * 60 * 10,
  });
  const appInfo = appInfoRaw?.data ?? appInfoRaw ?? null;

  function isActive(href) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  const getInitialOpen = () => {
    const open = {};
    navGroups.forEach((group, gi) => {
      if (!group.label) return;
      if (group.items.some(item => isActive(item.href))) open[gi] = true;
    });
    return open;
  };

  const [openGroups, setOpenGroups] = useState(getInitialOpen);

  useEffect(() => {
    setOpenGroups(prev => {
      const next = { ...prev };
      navGroups.forEach((group, gi) => {
        if (!group.label) return;
        if (group.items.some(item => isActive(item.href))) next[gi] = true;
      });
      return next;
    });
  }, [pathname]);

  const toggle = (gi) => setOpenGroups(prev => ({ ...prev, [gi]: !prev[gi] }));

  const sidebarContent = (
    <aside className="w-64 h-full bg-white flex flex-col border-s border-[#e4e9f2]">
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#e4e9f2] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-navy-50 flex items-center justify-center border border-navy-100">
            {appInfo?.logo ? (
              <img src={appInfo.logo} alt="شعار" className="w-full h-full object-contain" />
            ) : (
              <svg className="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            )}
          </div>
          <span className="font-bold text-navy-900 truncate text-sm leading-tight">
            {appInfo?.app_name || 'نظام المحاماة'}
          </span>
        </div>
        {/* Mobile close button */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden mr-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navGroups.map((group, gi) => {
          const visibleItems = group.items.filter(item => hasPermission(item.permission));
          if (visibleItems.length === 0) return null;

          const isOpen = openGroups[gi] ?? false;
          const hasActive = visibleItems.some(item => isActive(item.href));

          if (!group.label) {
            return (
              <div key={gi} className="pb-1 mb-1 border-b border-[#e4e9f2] last:border-0 last:mb-0 last:pb-0">
                {visibleItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive(item.href)
                        ? 'bg-navy-700 text-white shadow-sm shadow-navy-700/20'
                        : 'text-slate-600 hover:bg-navy-50 hover:text-navy-800'
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive(item.href) ? 2.5 : 2} d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                ))}
              </div>
            );
          }

          return (
            <div key={gi}>
              <button
                onClick={() => toggle(gi)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  hasActive ? 'text-navy-700 bg-navy-50' : 'text-slate-600 hover:bg-gray-50 hover:text-slate-800'
                }`}
              >
                <svg className={`w-4 h-4 flex-shrink-0 ${hasActive ? 'text-navy-600' : 'text-slate-400'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={group.icon} />
                </svg>
                <span className="flex-1 text-right truncate text-xs tracking-wide uppercase">{group.label}</span>
                <svg
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${hasActive ? 'text-navy-500' : 'text-slate-300'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                style={{ maxHeight: isOpen ? `${visibleItems.length * 40}px` : '0px' }}
                className="overflow-hidden transition-all duration-300 ease-in-out"
              >
                <div className="ms-3.5 border-s-2 border-navy-100 ps-2 py-1 space-y-0.5">
                  {visibleItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                        isActive(item.href)
                          ? 'bg-navy-700 text-white font-medium shadow-sm shadow-navy-700/15'
                          : 'text-slate-600 hover:bg-navy-50 hover:text-navy-800'
                      }`}
                    >
                      <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isActive(item.href) ? 'text-white/80' : 'text-slate-400'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive(item.href) ? 2.5 : 2} d={item.icon} />
                      </svg>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-[#e4e9f2]">
        <div className="flex items-center gap-2.5 mb-2 px-1">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-navy-100 flex items-center justify-center border border-navy-200">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-navy-700 font-bold text-sm">{user?.name?.charAt(0) || 'م'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <Link href="/profile" onClick={onMobileClose}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-navy-50 hover:text-navy-700 rounded-lg transition-colors mb-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          الملف الشخصي
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
      {/* Desktop */}
      <div className="hidden lg:flex flex-col w-64 min-h-screen flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative z-50 flex-shrink-0 w-72 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
