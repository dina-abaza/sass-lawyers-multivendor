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

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminDashboardPage() {
  // إجمالي اشتراكات المكاتب (بدون فلتر = الكل)
  const { data: allSubsData, isLoading: loadingAll } = useQuery({
    queryKey: ['tenant-subs-all'],
    queryFn: () => subscriptionsApi.getByStatus('').then((r) => r.data),
  });

  // الاشتراكات النشطة — تُستخدم أيضاً لاستخلاص المحامين النشطين
  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: ['tenant-subs-active'],
    queryFn: () => subscriptionsApi.getByStatus('active').then((r) => r.data),
  });

  // المحامون قيد الانتظار
  const { data: vendorsData, isLoading: loadingVendors } = useQuery({
    queryKey: ['pending-vendors'],
    queryFn: () => adminApi.getPendingVendors().then((r) => r.data),
  });

  const totalSubs   = allSubsData?.count  ?? (allSubsData?.data?.length  ?? 0);
  const activeCount = activeData?.count   ?? (activeData?.data?.length   ?? 0);
  const activeList  = activeData?.data    ?? [];
  const vendorsList = vendorsData?.data   ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم مدير النظام</h1>
        <p className="text-gray-500 text-sm mt-1">مرحباً بك في نظام الإدارة العليا</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
          label="المكاتب النشطة (اشتراك فعال)"
          value={loadingActive ? '...' : activeCount}
          color="bg-green-50"
          icon={
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Active Lawyers / Offices */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              <h2 className="font-semibold text-gray-900">المحامون النشطون (اشتراك فعال)</h2>
            </div>
            <Link href="/admin/subscriptions" className="text-sm text-purple-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="p-4">
            {loadingActive ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : activeList.length === 0 ? (
              <div className="text-center py-8 space-y-1">
                <p className="text-sm text-gray-400">لا يوجد مكاتب ذات اشتراك نشط حالياً</p>
                <p className="text-xs text-gray-300">المحامون المعتمدون يظهرون هنا بعد تفعيل اشتراكاتهم</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeList.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-2.5 px-1 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                        {(s.tenant_id || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{s.tenant_id || '—'}</p>
                        <p className="text-xs text-gray-400">
                          ينتهي: {formatDate(s.expires_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                        {s.plan?.name || 'غير محدد'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {s.type === 'yearly' ? 'سنوي' : 'شهري'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Subscriptions Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <h2 className="font-semibold text-gray-900">الاشتراكات النشطة</h2>
            </div>
            <Link href="/admin/subscriptions" className="text-sm text-purple-600 hover:underline">
              إدارة الاشتراكات
            </Link>
          </div>
          <div className="p-4">
            {loadingActive ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : activeList.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">لا توجد اشتراكات نشطة</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100">
                      <th className="text-right pb-2 font-medium">المكتب</th>
                      <th className="text-right pb-2 font-medium">الباقة</th>
                      <th className="text-right pb-2 font-medium">انتهاء</th>
                      <th className="text-right pb-2 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeList.slice(0, 6).map((s) => (
                      <tr key={s.id}>
                        <td className="py-2.5 font-medium text-gray-800">{s.tenant_id || '—'}</td>
                        <td className="py-2.5 text-gray-600">{s.plan?.name || '—'}</td>
                        <td className="py-2.5 text-gray-500">{formatDate(s.expires_at)}</td>
                        <td className="py-2.5">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            نشط
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Pending Vendors */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
            <h2 className="font-semibold text-gray-900">محامين قيد الانتظار</h2>
          </div>
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
                <div
                  key={v.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm shrink-0">
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

    </div>
  );
}
