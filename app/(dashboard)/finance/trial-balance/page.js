'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ميزان المراجعة</h1>
        {!isLoading && list.length > 0 && (
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isBalanced ? '✓ الميزان متوازن' : '✗ الميزان غير متوازن'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الحساب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">النوع</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">مدين</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">دائن</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الرصيد</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">نوع الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">لا توجد بيانات — أضف قيوداً يومية أولاً</td></tr>
              ) : (
                list.map((row) => (
                  <tr key={row.account_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{row.account_name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${row.status === 'creditor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {row.status === 'creditor' ? 'دائن' : 'مدين'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{Number(row.total_debit) > 0 ? Number(row.total_debit).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{Number(row.total_credit) > 0 ? Number(row.total_credit).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{Number(row.balance) !== 0 ? Number(row.balance).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        row.balance_type === 'دائن' ? 'bg-green-100 text-green-700' :
                        row.balance_type === 'مدين' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {row.balance_type}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={2} className="px-4 py-3 font-bold text-gray-900">الإجمالي</td>
                <td className={`px-4 py-3 font-bold ${isBalanced ? 'text-green-700' : 'text-red-600'}`}>{Number(totalDebit).toLocaleString()}</td>
                <td className={`px-4 py-3 font-bold ${isBalanced ? 'text-green-700' : 'text-red-600'}`}>{Number(totalCredit).toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
