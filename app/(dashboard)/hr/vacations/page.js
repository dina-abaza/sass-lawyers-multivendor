'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { vacationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function VacationsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vacations'],
    queryFn: () => vacationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vacationsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vacations'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الإجازات</h1>
        <Link href="/hr/vacations/create"><Button>+ إجازة جديدة</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد إجازات مسجلة</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الموظف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ البداية</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ النهاية</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">ملاحظات</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{v.employee?.name || v.employee_id}</td>
                  <td className="px-4 py-3 text-gray-600">{v.start_date}</td>
                  <td className="px-4 py-3 text-gray-600">{v.end_date}</td>
                  <td className="px-4 py-3 text-gray-600">{v.notes}</td>
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <Link href={`/hr/vacations/${v.id}/edit`} className="text-indigo-600 hover:underline text-xs me-3">تعديل</Link>
                    <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(v.id); }}
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
