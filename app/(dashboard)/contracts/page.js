'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { contractsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function ContractsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contractsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">العقود</h1>
        <Link href="/contracts/create"><Button>+ عقد جديد</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد عقود مسجلة</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">رقم العقد</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">العميل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ البداية</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ النهاية</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">القيمة</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-900">{c.contract_number}</td>
                  <td className="px-4 py-3 text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.customer?.name || c.customer_id}</td>
                  <td className="px-4 py-3 text-gray-600">{c.start_date}</td>
                  <td className="px-4 py-3 text-gray-600">{c.end_date}</td>
                  <td className="px-4 py-3 text-gray-600">{c.value?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-left">
                    <Link href={`/contracts/${c.id}`} className="text-blue-600 hover:underline text-xs me-3">عرض</Link>
                    <Link href={`/contracts/${c.id}/edit`} className="text-gray-600 hover:underline text-xs me-3">تعديل</Link>
                    <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(c.id); }}
                      className="text-red-600 hover:text-red-800 text-xs">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
