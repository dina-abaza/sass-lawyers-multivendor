'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const STATUS_COLORS = {
  نشطة:   'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  ارشيف:  'bg-[#8896A7]/10 text-[#4A5568] ring-1 ring-inset ring-[#8896A7]/20',
  متوقفة: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
};

const thCls = 'text-right px-4 py-3.5 font-semibold text-[#4A5568] text-xs uppercase tracking-wide';

export default function CasesPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['cases'],
    queryFn: () => tenantApi.get('/cases').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tenantApi.delete(`/cases/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cases'] }),
  });

  const cases = Array.isArray(data) ? data : data?.data ?? [];
  const filtered = cases.filter(
    (c) =>
      c.case_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.customer?.name?.includes(search) ||
      c.subject?.includes(search)
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الكيانات</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>القضايا</h1>
              <p className="text-white/50 text-sm mt-0.5">{filtered.length} قضية</p>
            </div>
          </div>
          <Link href="/cases/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shrink-0"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            قضية جديدة
          </Link>
        </div>
      </div>

      {/* بحث */}
      <div className="relative">
        <svg className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full h-11 ps-10 pe-4 rounded-xl border border-[#E2E6F0] bg-white text-sm shadow-[0_1px_2px_rgba(8,26,58,0.04)] focus:ring-2 focus:ring-[#081A3A]/15 focus:border-[#081A3A] outline-none placeholder:text-[#8896A7] transition-all"
          placeholder="بحث برقم القضية أو اسم العميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* المحتوى */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorMessage error={error} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#EBF0FA] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#081A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <p className="text-[#0A1628] font-semibold">لا توجد قضايا</p>
          <p className="text-sm text-[#8896A7] mt-1">ابدأ بإضافة أول قضية</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
                <tr>
                  <th className={thCls}>رقم القضية</th>
                  <th className={thCls}>العميل</th>
                  <th className={thCls}>الموضوع</th>
                  <th className={thCls}>الحالة</th>
                  <th className={thCls}>التاريخ</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-4 py-3.5 font-bold text-[#081A3A]">{c.case_number}</td>
                    <td className="px-4 py-3.5 text-[#0A1628] font-medium">{c.customer?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[#4A5568] max-w-xs truncate">{c.subject ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      {c.status?.name ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[c.status.name] ?? 'bg-[#8896A7]/10 text-[#4A5568] ring-1 ring-inset ring-[#8896A7]/20'}`}>
                          {c.status.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[#8896A7]">{c.date ? new Date(c.date).toLocaleDateString('ar-SA') : '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Link href={`/cases/${c.id}`}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#EBF0FA] text-[#081A3A] hover:bg-[#081A3A]/15 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          onClick={() => { if (confirm('هل أنت متأكد من حذف هذه القضية؟')) deleteMutation.mutate(c.id); }}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
