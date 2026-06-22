'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { sessionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function SessionsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sessionsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">جلسات المحكمة</h1>
        <Link href="/sessions/create">
          <Button>+ جلسة جديدة</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد جلسات مسجلة</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">رقم الجلسة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">القضية</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الجهة القضائية</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الجهة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الوقت</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.session_number || `#${s.id}`}</td>
                  <td className="px-4 py-3 text-gray-600">{s.legal_case?.case_number || s.case_id}</td>
                  <td className="px-4 py-3 text-gray-600">{s.court_side || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.agency || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.date || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.session_time || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.status?.name || '—'}</td>
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <Link href={`/sessions/${s.id}`} className="text-blue-600 hover:underline text-xs me-3">عرض</Link>
                    <Link href={`/sessions/${s.id}/edit`} className="text-indigo-600 hover:underline text-xs me-3">تعديل</Link>
                    <button
                      onClick={() => { if (confirm('حذف هذه الجلسة؟')) deleteMutation.mutate(s.id); }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      حذف
                    </button>
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
