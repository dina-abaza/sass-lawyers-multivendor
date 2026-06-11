'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { adminApi, subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Link from 'next/link';

function StatCard({ label, value, color, icon, href }) {
  const inner = (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 ${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data),
  });

  const { data: vendorsData, isLoading: loadingVendors } = useQuery({
    queryKey: ['pending-vendors'],
    queryFn: () => adminApi.getPendingVendors().then((r) => r.data),
  });

  const { data: subsData, isLoading: loadingSubs } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.getAll().then((r) => r.data),
  });

  const isLoading = loadingUsers || loadingVendors || loadingSubs;

  function count(data) {
    if (!data) return null;
    if (Array.isArray(data)) return data.length;
    if (data?.data && Array.isArray(data.data)) return data.data.length;
    return null;
  }

  const subsList = Array.isArray(subsData) ? subsData : subsData?.data ?? [];
  const activeSubsCount = subsList.filter((s) => s.status === 'active').length;
  const pendingVendorsCount = count(vendorsData);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مرحباً، {user?.name}</h1>
        <p className="text-gray-500 mt-1">نظرة عامة على النظام</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="إجمالي المستخدمين"
              value={count(usersData)}
              color="bg-blue-50"
              href="/admin/users"
              icon={
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <StatCard
              label="طلبات البائعين المعلقة"
              value={pendingVendorsCount}
              color="bg-yellow-50"
              href="/admin/vendors"
              icon={
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="إجمالي الاشتراكات"
              value={count(subsData)}
              color="bg-purple-50"
              href="/admin/subscriptions"
              icon={
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
            />
            <StatCard
              label="الاشتراكات النشطة"
              value={activeSubsCount}
              color="bg-green-50"
              href="/admin/subscriptions"
              icon={
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">إجراءات سريعة</h2>
              <div className="space-y-2">
                {[
                  { label: 'إضافة مستخدم جديد', href: '/admin/users', color: 'bg-blue-600' },
                  { label: 'مراجعة طلبات البائعين', href: '/admin/vendors', color: 'bg-yellow-600' },
                  { label: 'إدارة الاشتراكات', href: '/admin/subscriptions', color: 'bg-purple-600' },
                  { label: 'إرسال إشعار', href: '/admin/notifications', color: 'bg-gray-700' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white ${item.color} hover:opacity-90 transition-opacity`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">آخر الاشتراكات</h2>
              {subsList.length === 0 ? (
                <p className="text-sm text-gray-400">لا توجد اشتراكات</p>
              ) : (
                <div className="space-y-3">
                  {subsList.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{s.tenant?.name || `مكتب #${s.tenant_id}`}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'active' ? 'bg-green-100 text-green-700' :
                        s.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {s.status === 'active' ? 'نشط' : s.status === 'cancelled' ? 'ملغى' : s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
