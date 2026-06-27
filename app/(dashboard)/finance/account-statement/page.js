'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const selectCls = 'h-10 w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors';
const thCls     = 'text-right px-4 py-3.5 font-semibold text-[#4A5568] text-xs uppercase tracking-wide';

export default function AccountStatementPage() {
  const { tenantApi } = useAuth();
  const [accountId, setAccountId]     = useState('');
  const [from, setFrom]               = useState('');
  const [to, setTo]                   = useState('');
  const [queryParams, setQueryParams] = useState(null);

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const accounts = (() => {
    const raw = Array.isArray(accountsData) ? accountsData : accountsData?.data ?? [];
    const flatten = (list) => list.reduce((acc, a) => {
      acc.push(a);
      if (a.children?.length) acc.push(...flatten(a.children));
      return acc;
    }, []);
    return flatten(raw);
  })();

  const { data: raw, isLoading } = useQuery({
    queryKey: ['account-statement', queryParams],
    queryFn: () => accountsApi.getAccountStatement(tenantApi, queryParams).then((r) => r.data),
    enabled: !!tenantApi && !!queryParams,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accountId) return;
    const params = { account_id: accountId };
    if (from) params.from = from;
    if (to)   params.to   = to;
    setQueryParams({ ...params });
  };

  const response      = raw ?? {};
  const accountName   = response.account ?? '';
  const entries       = response.data ?? [];
  const totalDebit    = response.total_debit ?? 0;
  const totalCredit   = response.total_credit ?? 0;
  const finalBalance  = response.final_balance ?? null;
  const selectedAccount = accounts.find((a) => String(a.id) === String(accountId));
  const formatDate    = (iso) => iso ? iso.split('T')[0] : '—';

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المالية</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>كشف الحساب</h1>
            <p className="text-white/50 text-sm mt-0.5">عرض حركات الحساب في فترة زمنية</p>
          </div>
        </div>
      </div>

      {/* فورم الفلترة */}
      <form onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)] space-y-4">
        <h2 className="font-semibold text-[#0A1628] text-sm flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          اختر الحساب والفترة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#4A5568]">الحساب <span className="text-red-500">*</span></label>
            <select value={accountId}
              onChange={(e) => { setAccountId(e.target.value); setQueryParams(null); }}
              required className={selectCls}>
              <option value="">— اختر حساباً —</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#4A5568]">من تاريخ</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#4A5568]">إلى تاريخ</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={selectCls} />
          </div>
        </div>
        <button type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff', boxShadow: '0 4px 12px rgba(8,26,58,0.2)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          عرض الكشف
        </button>
      </form>

      {/* النتائج */}
      {queryParams && (
        isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-4">
            {/* ملخص الحساب */}
            <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
              <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
                ملخص الحساب
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="sm:col-span-2">
                  <p className="text-xs text-[#8896A7] mb-1 font-medium">الحساب</p>
                  <p className="font-semibold text-[#0A1628] text-sm">{accountName || selectedAccount?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8896A7] mb-1 font-medium">النوع</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    selectedAccount?.status === 'creditor'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-[#EBF0FA] text-[#081A3A]'
                  }`}>
                    {selectedAccount?.status === 'creditor' ? 'دائن' : 'مدين'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#8896A7] mb-1 font-medium">إجمالي المدين</p>
                  <p className="font-semibold text-[#0A1628] text-sm">{Number(totalDebit).toLocaleString()} ر.س</p>
                </div>
                <div>
                  <p className="text-xs text-[#8896A7] mb-1 font-medium">إجمالي الدائن</p>
                  <p className="font-semibold text-[#0A1628] text-sm">{Number(totalCredit).toLocaleString()} ر.س</p>
                </div>
                {finalBalance !== null && (
                  <div className="sm:col-span-5 pt-3 border-t border-[#F0F2F7] flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#4A5568]">الرصيد الختامي</p>
                    <p className={`font-bold text-lg ${Number(finalBalance) < 0 ? 'text-red-600' : 'text-[#D4AF37]'}`}>
                      {Math.abs(Number(finalBalance)).toLocaleString()} ر.س
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* جدول الحركات */}
            <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
                    <tr>
                      <th className={thCls}>التاريخ</th>
                      <th className={thCls}>البيان</th>
                      <th className={thCls}>مدين</th>
                      <th className={thCls}>دائن</th>
                      <th className={thCls}>الرصيد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F7]">
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-[#8896A7] text-sm">
                          لا توجد حركات لهذا الحساب
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry, i) => (
                        <tr key={i} className="hover:bg-[#F8F9FC] transition-colors">
                          <td className="px-4 py-3.5 text-[#4A5568]">{formatDate(entry.date)}</td>
                          <td className="px-4 py-3.5 text-[#0A1628]">{entry.description || '—'}</td>
                          <td className="px-4 py-3.5 text-[#0A1628]">{Number(entry.debit) > 0 ? Number(entry.debit).toLocaleString() : '—'}</td>
                          <td className="px-4 py-3.5 text-[#0A1628]">{Number(entry.credit) > 0 ? Number(entry.credit).toLocaleString() : '—'}</td>
                          <td className={`px-4 py-3.5 font-semibold ${Number(entry.balance) < 0 ? 'text-red-600' : 'text-[#0A1628]'}`}>
                            {Math.abs(Number(entry.balance)).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {entries.length > 0 && (
                    <tfoot style={{ background: '#F0F4FA' }} className="border-t-2 border-[#E2E6F0]">
                      <tr>
                        <td colSpan={2} className="px-4 py-3.5 font-bold text-[#0A1628]">الإجمالي</td>
                        <td className="px-4 py-3.5 font-bold text-[#0A1628]">{Number(totalDebit).toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-bold text-[#0A1628]">{Number(totalCredit).toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-bold" style={{ color: '#D4AF37' }}>
                          {finalBalance !== null ? Math.abs(Number(finalBalance)).toLocaleString() : ''}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
