'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { invoicesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const thCls = 'text-right px-4 py-3.5 font-semibold text-[#4A5568] text-xs uppercase tracking-wide';

export default function ConsultingInvoicesPage() {
  const { tenantApi } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['consulting-invoices'],
    queryFn: () => invoicesApi.getConsultingInvoices(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المالية</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>فواتير الاستشارات</h1>
              <p className="text-white/50 text-sm mt-0.5">أتعاب الاستشارات القانونية المقدمة للعملاء</p>
            </div>
          </div>
          <Link href="/finance/consulting-invoices/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            فاتورة جديدة
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <p className="text-[#8896A7] text-sm">لا توجد فواتير</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
                <tr>
                  <th className={thCls}>#</th>
                  <th className={thCls}>الاستشارة</th>
                  <th className={thCls}>المبلغ</th>
                  <th className={thCls}>الضريبة</th>
                  <th className={thCls}>الإجمالي</th>
                  <th className={thCls}>التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {list.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-4 py-3.5 text-[#8896A7] font-mono text-xs">{inv.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#0A1628]">{inv.consultation?.subject || inv.consultation_id}</td>
                    <td className="px-4 py-3.5 text-[#0A1628] font-medium">{Number(inv.amount).toLocaleString()} ر.س</td>
                    <td className="px-4 py-3.5 text-[#4A5568]">
                      {Number(inv.tax_value).toLocaleString()} ر.س{' '}
                      <span className="text-xs text-[#8896A7]">({inv.tax_rate}%)</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold" style={{ color: '#D4AF37' }}>{Number(inv.total_amount).toLocaleString()} ر.س</td>
                    <td className="px-4 py-3.5 text-[#4A5568]">{inv.created_at?.substring(0, 10)}</td>
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
