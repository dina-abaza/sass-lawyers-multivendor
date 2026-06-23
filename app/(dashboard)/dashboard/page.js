'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';

const STATS = [
  {
    key: 'cases',
    label: 'القضايا',
    href: '/cases',
    endpoint: '/cases',
    icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    color: 'bg-navy-50 text-navy-700',
    accent: 'bg-navy-700',
  },
  {
    key: 'customers',
    label: 'العملاء',
    href: '/customers',
    endpoint: '/customers',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    color: 'bg-emerald-50 text-emerald-700',
    accent: 'bg-emerald-600',
  },
  {
    key: 'employees',
    label: 'الموظفون',
    href: '/employees',
    endpoint: '/employees',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    color: 'bg-violet-50 text-violet-700',
    accent: 'bg-violet-600',
  },
];

const QUICK_ACTIONS = [
  { label: 'قضية جديدة',     href: '/cases/create',     icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
  { label: 'عميل جديد',      href: '/customers/create',  icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  { label: 'موظف جديد',      href: '/employees/create',  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'أرشيف القضايا',  href: '/cases/archive',     icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  { label: 'المهام',          href: '/tasks',             icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { label: 'الاستشارات',     href: '/consultations',     icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
];

function count(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data.length;
  if (data?.data && Array.isArray(data.data)) return data.data.length;
  if (typeof data?.total === 'number') return data.total;
  return null;
}

export default function DashboardPage() {
  const { tenantApi, user } = useAuth();

  const queries = STATS.map(stat =>
    useQuery({
      queryKey: [stat.key + '-count'],
      queryFn: () => tenantApi?.get(stat.endpoint).then(r => r.data),
      enabled: !!tenantApi,
    })
  );

  const isLoading = queries.some(q => q.isLoading);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900">
            مرحباً، {user?.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">إليك ملخص الوضع الراهن في مكتبك</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((stat, i) => {
            const val = count(queries[i].data);
            return (
              <Link
                key={stat.key}
                href={stat.href}
                className="group bg-white rounded-2xl border border-[#e4e9f2] p-5 flex items-center gap-4 hover:border-navy-200 hover:shadow-md hover:shadow-navy-700/5 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color} group-hover:scale-105 transition-transform`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-navy-900 mt-0.5">{val ?? '—'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-[#e4e9f2] p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">الإجراءات السريعة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {QUICK_ACTIONS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#e4e9f2] text-center hover:border-navy-200 hover:bg-navy-50 transition-all duration-150 group"
            >
              <div className="w-9 h-9 rounded-xl bg-navy-50 group-hover:bg-navy-100 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-700 leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
