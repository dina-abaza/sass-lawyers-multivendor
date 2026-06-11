'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';

function StatCard({ label, value, color, href, icon }) {
  return (
    <Link href={href} className={`bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { tenantApi, user } = useAuth();

  const { data: cases, isLoading: loadingCases } = useQuery({
    queryKey: ['cases-count'],
    queryFn: () => tenantApi?.get('/cases').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers-count'],
    queryFn: () => tenantApi?.get('/customers').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees-count'],
    queryFn: () => tenantApi?.get('/employees').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const isLoading = loadingCases || loadingCustomers || loadingEmployees;

  function countData(data) {
    if (!data) return null;
    if (Array.isArray(data)) return data.length;
    if (data?.data && Array.isArray(data.data)) return data.data.length;
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مرحباً، {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">إليك ملخص الوضع الراهن في مكتبك</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="إجمالي القضايا"
            value={countData(cases)}
            color="bg-blue-50"
            href="/cases"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            }
          />
          <StatCard
            label="إجمالي العملاء"
            value={countData(customers)}
            color="bg-green-50"
            href="/customers"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="إجمالي الموظفين"
            value={countData(employees)}
            color="bg-purple-50"
            href="/employees"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">الإجراءات السريعة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'قضية جديدة', href: '/cases/create', color: 'bg-blue-600 text-white' },
            { label: 'عميل جديد', href: '/customers/create', color: 'bg-green-600 text-white' },
            { label: 'موظف جديد', href: '/employees/create', color: 'bg-purple-600 text-white' },
            { label: 'أرشيف القضايا', href: '/cases/archive', color: 'bg-gray-100 text-gray-700' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center rounded-lg p-3 text-sm font-medium text-center transition-opacity hover:opacity-90 ${item.color}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
