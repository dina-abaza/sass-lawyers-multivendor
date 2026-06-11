'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

export default function TrialBalancePage() {
  const { tenantApi } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: () => accountsApi.getTrialBalance(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];
  const totalDebit = list.reduce((s, r) => s + (r.debit || 0), 0);
  const totalCredit = list.reduce((s, r) => s + (r.credit || 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ميزان المراجعة</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الحساب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">مدين</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">دائن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((row) => (
                <tr key={row.id || row.account_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{row.account_name || row.name}</td>
                  <td className="px-4 py-3 text-gray-700">{row.debit ? row.debit.toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{row.credit ? row.credit.toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-4 py-3 font-bold text-gray-900">الإجمالي</td>
                <td className="px-4 py-3 font-bold text-gray-900">{totalDebit.toLocaleString()}</td>
                <td className="px-4 py-3 font-bold text-gray-900">{totalCredit.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
