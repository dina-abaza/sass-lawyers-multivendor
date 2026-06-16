'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi, subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Link from 'next/link';

function StatCard({ label, value, badge, color, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-3xl font-bold text-gray-900">{value ?? '—'}</span>
          {badge !== undefined && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {badge} نشط
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  // إجمالي اشتراكات المكاتب (بدون فلتر = الكل)
  const { data: allSubsData, isLoading: loadingAll } = useQuery({
    queryKey: ['tenant-subs-all'],
    queryFn: () => subscriptionsApi.getByStatus('').then((r) => r.data),
  });

  // الاشتراكات النشطة
  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: ['tenant-subs-active'],
    queryFn: () => subscriptionsApi.getByStatus('active').then((r) => r.data),
  });

  // الاشتراكات المنتهية/الملغاة
  const { data: canceledData, isLoading: loadingCanceled } = useQuery({
    queryKey: ['tenant-subs-canceled'],
    queryFn: () => subscriptionsApi.getByStatus('canceled').then((r) => r.data),
  });

  // المحامون قيد الانتظار
  const { data: vendorsData, isLoading: loadingVendors } = useQuery({
    queryKey: ['pending-vendors'],
    queryFn: () => adminApi.getPendingVendors().then((r) => r.data),
  });

  const totalSubs  = allSubsData?.count   ?? (allSubsData?.data?.length  ?? 0);
  const activeCount = activeData?.count   ?? (activeData?.data?.length   ?? 0);
  const activeList  = activeData?.data    ?? [];
  const canceledList = canceledData?.data ?? [];
  const vendorsList  = vendorsData?.data  ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم مدير النظام</h1>
        <p className="text-gray-500 text-sm mt-1">مرحباً بك في نظام الإدارة العليا</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          label="إجمالي الاشتراكات"
          value={loadingAll ? '...' : totalSubs}
          badge={loadingActive ? '...' : activeCount}
          color="bg-blue-50"
          icon={
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          label="محامين قيد الانتظار"
          value={loadingVendors ? '...' : vendorsList.length}
          color="bg-orange-50"
          icon={
            <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Pending Vendors – wider */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">محامين قيد الانتظار</h2>
            <Link href="/admin/vendors" className="text-sm text-purple-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="p-4">
            {loadingVendors ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : vendorsList.length === 0 ? (
              <p className="text-center py-6 text-sm text-gray-400">لا يوجد محامون قيد الانتظار</p>
            ) : (
              <div className="space-y-3">
                {vendorsList.slice(0, 6).map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
                        {(v.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{v.name}</p>
                        <p className="text-xs text-gray-500">{v.email}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                      قيد الانتظار
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subscription Tables stacked */}
        <div className="lg:col-span-3 space-y-5">

          {/* Active */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                <h2 className="font-semibold text-gray-900 text-sm">الاشتراكات النشطة</h2>
              </div>
              <Link href="/admin/subscriptions/management?status=active" className="text-xs text-purple-600 hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="p-4">
              {loadingActive ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : activeList.length === 0 ? (
                <p className="text-center py-4 text-sm text-gray-400">لا توجد اشتراكات نشطة</p>
              ) : (
                <div className="space-y-2">
                  {activeList.slice(0, 4).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                      <span className="font-medium text-gray-800">{s.tenant_id || '—'}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {s.plan?.name || 'غير محدد'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expired */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                <h2 className="font-semibold text-gray-900 text-sm">الاشتراكات المنتهية</h2>
              </div>
              <Link href="/admin/subscriptions/management?status=canceled" className="text-xs text-purple-600 hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="p-4">
              {loadingCanceled ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : canceledList.length === 0 ? (
                <p className="text-center py-4 text-sm text-gray-400">لا توجد اشتراكات منتهية</p>
              ) : (
                <div className="space-y-2">
                  {canceledList.slice(0, 4).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                      <span className="font-medium text-gray-800">{s.tenant_id || '—'}</span>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        {s.plan?.name || 'غير محدد'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
