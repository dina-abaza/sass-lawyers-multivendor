'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { tasksApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

const TYPE_LABELS = { internal: 'داخلية', external: 'خارجية' };

export default function TasksArchivePage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks-archive'],
    queryFn: () => tasksApi.getArchived(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tasksApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-archive'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">أرشيف المهام</h1>
        <Link href="/tasks"><Button variant="outline">العودة للمهام</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد مهام مؤرشفة</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المهمة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الموظف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">القضية</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">النوع</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">ملاحظات</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600">{t.employee?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{t.legal_case?.case_number || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[t.type] || t.type}</td>
                  <td className="px-4 py-3 text-gray-600">{t.date || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{t.notes || '—'}</td>
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <Link href={`/tasks/${t.id}/edit`} className="text-indigo-600 hover:underline text-xs me-3">تعديل</Link>
                    <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(t.id); }}
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
