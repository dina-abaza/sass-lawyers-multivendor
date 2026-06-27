'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const thCls = 'text-right px-4 py-3.5 font-semibold text-[#4A5568] text-xs uppercase tracking-wide';

export default function TrialBalancePage() {
  const { tenantApi } = useAuth();

  const { data: raw, isLoading } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: () => accountsApi.getTrialBalance(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const response = raw?.data ? raw : { data: Array.isArray(raw) ? raw : [], total_debit: 0, total_credit: 0, is_balanced: false };
  const list = response.data ?? [];
  const totalDebit = response.total_debit ?? 0;
  const totalCredit = response.total_credit ?? 0;
  const isBalanced = response.is_balanced ?? false;

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
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المالية</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>ميزان المراجعة</h1>
            </div>
          </div>
          {!isLoading && list.length > 0 && (
            <span className={`text-sm font-semibold px-3.5 py-1.5 rounded-xl ${
              isBalanced
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {isBalanced ? '✓ متوازن' : '✗ غير متوازن'}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
                <tr>
                  <th className={thCls}>الحساب</th>
                  <th className={thCls}>النوع</th>
                  <th className={thCls}>مدين</th>
                  <th className={thCls}>دائن</th>
                  <th className={thCls}>الرصيد</th>
                  <th className={thCls}>نوع الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#8896A7] text-sm">
                      لا توجد بيانات — أضف قيوداً يومية أولاً
                    </td>
                  </tr>
                ) : (
                  list.map((row) => (
                    <tr key={row.account_id} className="hover:bg-[#F8F9FC] transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-[#0A1628]">{row.account_name}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          row.status === 'creditor'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-[#EBF0FA] text-[#081A3A]'
                        }`}>
                          {row.status === 'creditor' ? 'دائن' : 'مدين'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#4A5568]">{Number(row.total_debit) > 0 ? Number(row.total_debit).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3.5 text-[#4A5568]">{Number(row.total_credit) > 0 ? Number(row.total_credit).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3.5 font-semibold text-[#0A1628]">{Number(row.balance) !== 0 ? Number(row.balance).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          row.balance_type === 'دائن' ? 'bg-emerald-100 text-emerald-700' :
                          row.balance_type === 'مدين' ? 'bg-[#EBF0FA] text-[#081A3A]' :
                          'bg-[#F0F2F7] text-[#8896A7]'
                        }`}>
                          {row.balance_type}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot style={{ background: '#F0F4FA' }} className="border-t-2 border-[#E2E6F0]">
                <tr>
                  <td colSpan={2} className="px-4 py-3.5 font-bold text-[#0A1628]">الإجمالي</td>
                  <td className={`px-4 py-3.5 font-bold text-sm ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
                    {Number(totalDebit).toLocaleString()}
                  </td>
                  <td className={`px-4 py-3.5 font-bold text-sm ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
                    {Number(totalCredit).toLocaleString()}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
