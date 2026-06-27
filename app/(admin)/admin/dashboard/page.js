'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi, subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Link from 'next/link';

function StatCard({ label, value, badge, icon, gradient }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(8,26,58,0.06)] hover:shadow-[0_4px_16px_rgba(8,26,58,0.10)] transition-shadow duration-200">
      <div className={`w-13 h-13 rounded-xl flex items-center justify-center shrink-0 ${gradient}`}
        style={{ width: 52, height: 52 }}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#8896A7]">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-2xl font-bold text-[#0A1628]">{value ?? '—'}</span>
          {badge !== undefined && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
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
  const { data: allSubsData, isLoading: loadingAll } = useQuery({
    queryKey: ['tenant-subs-all'],
    queryFn: () => subscriptionsApi.getByStatus('').then((r) => r.data),
  });

  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: ['tenant-subs-active'],
    queryFn: () => subscriptionsApi.getByStatus('active').then((r) => r.data),
  });

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
      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-1">لوحة تحكم</p>
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>مدير النظام</h1>
          <p className="text-white/50 text-sm mt-1">مرحباً بك في نظام الإدارة العليا</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="إجمالي الاشتراكات"
          value={loadingAll ? '...' : totalSubs}
          badge={loadingActive ? '...' : activeCount}
          gradient="bg-[#EBF0FA]"
          icon={
            <svg className="w-6 h-6 text-[#081A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          label="المكاتب النشطة"
          value={loadingActive ? '...' : activeCount}
          gradient="bg-emerald-50"
          icon={
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="محامين قيد الانتظار"
          value={loadingVendors ? '...' : vendorsList.length}
          gradient="bg-[#FDF8E7]"
          icon={
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Active Offices */}
        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F7]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <h2 className="font-semibold text-[#0A1628] text-sm">المحامون النشطون</h2>
            </div>
            <Link href="/admin/subscriptions" className="text-xs text-[#D4AF37] font-semibold hover:text-[#B8961F] transition-colors">
              عرض الكل
            </Link>
          </div>
          <div className="p-4">
            {loadingActive ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : activeList.length === 0 ? (
              <div className="text-center py-10 space-y-1">
                <p className="text-sm text-[#8896A7]">لا يوجد مكاتب ذات اشتراك نشط حالياً</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeList.slice(0, 6).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#F8F9FC] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#081A3A] font-bold text-sm shrink-0"
                        style={{ background: 'linear-gradient(135deg, #D4AF37, #E8C94A)' }}>
                        {(s.tenant_id || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#0A1628]">{s.tenant_id || '—'}</p>
                        <p className="text-xs text-[#8896A7]">ينتهي: {formatDate(s.expires_at)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                        {s.plan?.name || 'غير محدد'}
                      </span>
                      <span className="text-xs text-[#8896A7]">{s.type === 'yearly' ? 'سنوي' : 'شهري'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Subscriptions Table */}
        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F7]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#081A3A] inline-block" />
              <h2 className="font-semibold text-[#0A1628] text-sm">الاشتراكات النشطة</h2>
            </div>
            <Link href="/admin/subscriptions" className="text-xs text-[#D4AF37] font-semibold hover:text-[#B8961F] transition-colors">
              إدارة الاشتراكات
            </Link>
          </div>
          <div className="p-4">
            {loadingActive ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : activeList.length === 0 ? (
              <p className="text-center py-8 text-sm text-[#8896A7]">لا توجد اشتراكات نشطة</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#8896A7] border-b border-[#F0F2F7]">
                      <th className="text-right pb-2.5 font-medium">المكتب</th>
                      <th className="text-right pb-2.5 font-medium">الباقة</th>
                      <th className="text-right pb-2.5 font-medium">انتهاء</th>
                      <th className="text-right pb-2.5 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F9FC]">
                    {activeList.slice(0, 6).map((s) => (
                      <tr key={s.id} className="hover:bg-[#F8F9FC] transition-colors">
                        <td className="py-2.5 font-semibold text-[#0A1628]">{s.tenant_id || '—'}</td>
                        <td className="py-2.5 text-[#4A5568]">{s.plan?.name || '—'}</td>
                        <td className="py-2.5 text-[#8896A7]">{formatDate(s.expires_at)}</td>
                        <td className="py-2.5">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium text-xs">
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
      <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F7]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] inline-block" />
            <h2 className="font-semibold text-[#0A1628] text-sm">محامين قيد الانتظار</h2>
          </div>
          <Link href="/admin/vendors" className="text-xs text-[#D4AF37] font-semibold hover:text-[#B8961F] transition-colors">
            عرض الكل
          </Link>
        </div>
        <div className="p-4">
          {loadingVendors ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : vendorsList.length === 0 ? (
            <p className="text-center py-8 text-sm text-[#8896A7]">لا يوجد محامون قيد الانتظار</p>
          ) : (
            <div className="space-y-2">
              {vendorsList.slice(0, 6).map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#F8F9FC] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#FDF8E7] flex items-center justify-center text-[#B8961F] font-bold text-sm shrink-0">
                      {(v.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0A1628]">{v.name}</p>
                      <p className="text-xs text-[#8896A7]">{v.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-[#FDF8E7] text-[#B8961F] border border-[#D4AF37]/20 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
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
