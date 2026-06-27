'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { consultationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const thCls = 'text-right px-4 py-3.5 font-semibold text-[#4A5568] text-xs uppercase tracking-wide';

const typeLabel = { oral: 'شفهية', written: 'مكتوبة' };
const classLabel = {
  commercial: 'تجارية', civil: 'مدنية', criminal: 'جنائية', family: 'أسرة',
  labor: 'عمالية', environmental: 'بيئية', investment: 'استثمارية', international: 'دولية',
};

export default function ConsultationsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => consultationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => consultationsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consultations'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الكيانات</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>الاستشارات القانونية</h1>
              <p className="text-white/50 text-sm mt-0.5">{list.length} استشارة</p>
            </div>
          </div>
          <Link href="/consultations/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shrink-0"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            استشارة جديدة
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#EBF0FA] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#081A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-[#0A1628] font-semibold">لا توجد استشارات مسجلة</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
                <tr>
                  <th className={thCls}>العميل</th>
                  <th className={thCls}>الموضوع</th>
                  <th className={thCls}>النوع</th>
                  <th className={thCls}>التصنيف</th>
                  <th className={thCls}>المبلغ</th>
                  <th className={thCls}>الرد</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {list.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-[#0A1628]">{c.customer?.name || c.customer_id}</td>
                    <td className="px-4 py-3.5 text-[#4A5568] max-w-xs truncate">{c.subject}</td>
                    <td className="px-4 py-3.5 text-[#4A5568]">{typeLabel[c.consultation_type] || c.consultation_type}</td>
                    <td className="px-4 py-3.5 text-[#4A5568]">{classLabel[c.general_classification] || c.general_classification}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#081A3A]">{c.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      {c.response_text
                        ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">تم الرد</span>
                        : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">في الانتظار</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Link href={`/consultations/${c.id}`}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#EBF0FA] text-[#081A3A] hover:bg-[#081A3A]/15 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link href={`/consultations/${c.id}/edit`}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#EBF0FA] text-[#081A3A] hover:bg-[#081A3A]/15 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(c.id); }}>
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
