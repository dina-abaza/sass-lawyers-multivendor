'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function AccountStatementPage() {
  const { tenantApi } = useAuth();
  const [accountId, setAccountId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
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
    if (to) params.to = to;
    setQueryParams({ ...params });
  };

  const response = raw ?? {};
  const accountName = response.account ?? '';
  const entries = response.data ?? [];
  const totalDebit = response.total_debit ?? 0;
  const totalCredit = response.total_credit ?? 0;
  const finalBalance = response.final_balance ?? null;

  const selectedAccount = accounts.find((a) => String(a.id) === String(accountId));

  const formatDate = (iso) => {
    if (!iso) return '—';
    return iso.split('T')[0];
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">كشف الحساب</h1>

      {/* فورم الفلترة */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">الحساب <span className="text-red-500">*</span></label>
            <select
              value={accountId}
              onChange={(e) => { setAccountId(e.target.value); setQueryParams(null); }}
              required
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— اختر حساباً —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">من تاريخ</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">إلى تاريخ</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="mt-3">
          <Button type="submit">عرض الكشف</Button>
        </div>
      </form>

      {/* النتائج */}
      {queryParams && (
        isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-4">
            {/* معلومات الحساب */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">الحساب</p>
                <p className="font-semibold text-gray-900">{accountName || selectedAccount?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">النوع</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedAccount?.status === 'creditor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {selectedAccount?.status === 'creditor' ? 'دائن' : 'مدين'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">إجمالي المدين</p>
                <p className="font-semibold text-gray-900">{Number(totalDebit).toLocaleString()} ر.س</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">إجمالي الدائن</p>
                <p className="font-semibold text-gray-900">{Number(totalCredit).toLocaleString()} ر.س</p>
              </div>
              {finalBalance !== null && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">الرصيد الختامي</p>
                  <p className={`font-bold text-lg ${Number(finalBalance) < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                    {Math.abs(Number(finalBalance)).toLocaleString()} ر.س
                  </p>
                </div>
              )}
            </div>

            {/* جدول الحركات */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">البيان</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">مدين</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">دائن</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">الرصيد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">لا توجد حركات لهذا الحساب</td></tr>
                  ) : (
                    entries.map((entry, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{formatDate(entry.date)}</td>
                        <td className="px-4 py-3 text-gray-900">{entry.description || '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{Number(entry.debit) > 0 ? Number(entry.debit).toLocaleString() : '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{Number(entry.credit) > 0 ? Number(entry.credit).toLocaleString() : '—'}</td>
                        <td className={`px-4 py-3 font-medium ${Number(entry.balance) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {Math.abs(Number(entry.balance)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {entries.length > 0 && (
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 font-bold text-gray-900">الإجمالي</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{Number(totalDebit).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{Number(totalCredit).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-gray-700">
                        {finalBalance !== null ? Math.abs(Number(finalBalance)).toLocaleString() : ''}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
