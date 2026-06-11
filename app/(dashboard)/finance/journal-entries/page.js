'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

export default function JournalEntriesPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => accountsApi.getJournalEntries(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => accountsApi.deleteJournalEntry(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal-entries'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">القيود اليومية</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد قيود مسجلة</div>
      ) : (
        <div className="space-y-4">
          {list.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{entry.description}</p>
                  <p className="text-sm text-gray-500">{entry.entry_date}</p>
                </div>
                <button onClick={() => { if (confirm('حذف هذا القيد؟')) deleteMutation.mutate(entry.id); }}
                  className="text-red-500 hover:text-red-700 text-sm">حذف</button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-1.5 text-right font-medium text-gray-600">الحساب</th>
                    <th className="px-3 py-1.5 text-right font-medium text-gray-600">مدين</th>
                    <th className="px-3 py-1.5 text-right font-medium text-gray-600">دائن</th>
                  </tr>
                </thead>
                <tbody>
                  {(entry.items || []).map((item, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-1.5 text-gray-900">{item.account?.name || item.account_id}</td>
                      <td className="px-3 py-1.5 text-gray-700">{item.debit ? item.debit.toLocaleString() : '—'}</td>
                      <td className="px-3 py-1.5 text-gray-700">{item.credit ? item.credit.toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
