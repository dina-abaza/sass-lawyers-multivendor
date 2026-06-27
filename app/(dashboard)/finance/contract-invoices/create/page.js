'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { invoicesApi, contractsApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateContractInvoicePage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContractId = searchParams.get('contract_id') || '';

  const [form, setForm] = useState({ contract_id: preselectedContractId, amount: '' });
  const [error, setError] = useState(null);
  const [invoiceResult, setInvoiceResult] = useState(null);

  const { data: contracts } = useQuery({
    queryKey: [QUERY_KEYS.CONTRACTS],
    queryFn: () => contractsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => invoicesApi.createContractInvoice(tenantApi, data),
    onSuccess: (res) => {
      const response = res.data;
      if (response?.invoiceDetails) {
        setInvoiceResult(response);
      } else {
        router.push('/finance/contract-invoices');
      }
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (invoiceResult) {
    const inv = invoiceResult.invoiceDetails;
    const settings = invoiceResult.InvoiceSetting;
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-xl mx-auto">
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg className="w-6 h-6" style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#ffffff' }}>تم إصدار الفاتورة بنجاح</h2>
              {settings?.office_name && <p className="text-white/70 text-sm mt-0.5">{settings.office_name}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] divide-y divide-[#F0F2F7]">
          <div className="px-5 py-3.5 flex justify-between items-center">
            <span className="text-sm text-[#8896A7]">رقم الفاتورة</span>
            <span className="text-sm font-bold text-[#0A1628]">#{inv.id}</span>
          </div>
          <div className="px-5 py-3.5 flex justify-between items-center">
            <span className="text-sm text-[#8896A7]">العقد</span>
            <span className="text-sm font-medium text-[#0A1628]">{inv.contract?.name || inv.contract_id}</span>
          </div>
          <div className="px-5 py-3.5 flex justify-between items-center">
            <span className="text-sm text-[#8896A7]">المبلغ</span>
            <span className="text-sm font-medium text-[#0A1628]">{Number(inv.amount).toLocaleString()} ر.س</span>
          </div>
          {inv.tax_value > 0 && (
            <div className="px-5 py-3.5 flex justify-between items-center">
              <span className="text-sm text-[#8896A7]">الضريبة ({inv.tax_rate}%)</span>
              <span className="text-sm font-medium text-[#0A1628]">{Number(inv.tax_value).toLocaleString()} ر.س</span>
            </div>
          )}
          <div className="px-5 py-3.5 flex justify-between items-center bg-[#F8F9FC]">
            <span className="text-sm font-semibold text-[#4A5568]">الإجمالي</span>
            <span className="text-lg font-bold" style={{ color: '#D4AF37' }}>{Number(inv.total_amount).toLocaleString()} ر.س</span>
          </div>
          <div className="px-5 py-3.5 flex justify-between items-center">
            <span className="text-sm text-[#8896A7]">تاريخ الإصدار</span>
            <span className="text-sm text-[#4A5568]">{invoiceResult.printDate}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.push('/finance/contract-invoices')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff' }}>
            قائمة الفواتير
          </button>
          <button onClick={() => { setInvoiceResult(null); setForm({ contract_id: '', amount: '' }); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
            فاتورة جديدة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-xl mx-auto">

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
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>فاتورة عقد جديدة</h1>
            </div>
          </div>
          <Link href="/finance/contract-invoices"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            رجوع
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <div className="w-full h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #D4AF37, #B8961F)' }} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }} className="space-y-4">
          <ErrorMessage error={error} />
          <Select label="العقد" name="contract_id" value={form.contract_id} onChange={handleChange} options={toOptions(contracts, (x) => x.name || x.contract_number)} required />
          <Input label="المبلغ" name="amount" type="number" value={form.amount} onChange={handleChange} required />
          <div className="rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#6B5B1E' }}>
            سيتم احتساب الضريبة تلقائياً وفق إعدادات المكتب.
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
              {mutation.isPending
                ? <span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              إصدار الفاتورة
            </button>
            <Link href="/finance/contract-invoices"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
