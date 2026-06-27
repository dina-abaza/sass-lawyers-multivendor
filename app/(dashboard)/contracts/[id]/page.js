'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { contractsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

export default function ContractDetailPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });

  const contract = data?.data ?? data;

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  if (isError || !contract) return (
    <div className="p-6 text-center text-[#8896A7]">
      <p>تعذر تحميل بيانات العقد</p>
      <button onClick={() => router.back()} className="mt-3 text-[#D4AF37] hover:underline text-sm">رجوع</button>
    </div>
  );

  const fields = [
    { label: 'رقم العقد',       value: contract.contract_number || `#${contract.id}`, mono: true },
    { label: 'اسم العقد',       value: contract.name },
    { label: 'العميل',          value: contract.customer?.name || contract.customer_id },
    { label: 'تاريخ البداية',   value: contract.start_date ? String(contract.start_date).substring(0, 10) : null },
    { label: 'تاريخ الانتهاء',  value: contract.end_date ? String(contract.end_date).substring(0, 10) : null },
    { label: 'قيمة العقد',      value: contract.value != null ? `${Number(contract.value).toLocaleString()} ر.س` : null },
  ].filter(({ value }) => value);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">

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
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">العقود</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>تفاصيل العقد</h1>
              {contract.name && <p className="text-white/50 text-sm mt-0.5">{contract.name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </button>
            <Link href={`/contracts/${id}/edit`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              تعديل
            </Link>
          </div>
        </div>
      </div>

      {/* بيانات العقد */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-5 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          بيانات العقد
        </h2>
        <dl className="divide-y divide-[#F0F2F7]">
          {fields.map(({ label, value, mono }) => (
            <div key={label} className="flex items-center justify-between py-3.5">
              <dt className="text-sm text-[#8896A7]">{label}</dt>
              <dd className={`text-sm font-semibold text-[#0A1628] ${mono ? 'font-mono' : ''}`}>{value}</dd>
            </div>
          ))}
        </dl>
        {contract.notes && (
          <div className="mt-4 pt-4 border-t border-[#F0F2F7]">
            <p className="text-xs text-[#8896A7] mb-1.5 font-medium">ملاحظات</p>
            <p className="text-sm text-[#4A5568]">{contract.notes}</p>
          </div>
        )}
      </div>

      {/* الفواتير المرتبطة */}
      {contract.invoices && contract.invoices.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
            الفواتير المرتبطة
            <span className="text-xs text-[#8896A7] font-normal">({contract.invoices.length})</span>
          </h2>
          <div className="divide-y divide-[#F0F2F7]">
            {contract.invoices.map((inv) => (
              <div key={inv.id} className="flex justify-between items-center py-3">
                <span className="text-sm text-[#4A5568]">فاتورة #{inv.id}</span>
                <span className="text-sm font-semibold text-[#0A1628]">{Number(inv.total_amount).toLocaleString()} ر.س</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* أزرار الإجراءات */}
      <div className="flex gap-3">
        <Link href={`/finance/contract-invoices/create?contract_id=${contract.id}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إنشاء فاتورة
        </Link>
        <Link href="/contracts"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
          قائمة العقود
        </Link>
      </div>
    </div>
  );
}
