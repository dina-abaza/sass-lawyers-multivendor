'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { generalDocsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function GeneralDocumentsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['general-documents'],
    queryFn: () => generalDocsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => generalDocsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['general-documents'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">المستندات العامة</h1>
        <Link href="/documents/general/create"><Button>+ مستند جديد</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد مستندات</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">نوع الملف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الوصف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">ملاحظات</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الملفات</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.file_type}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{d.description || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{d.notes || '—'}</td>
                  <td className="px-4 py-3">
                    {Array.isArray(d.files) && d.files.length > 0
                      ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{d.files.length} ملف</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <Link href={`/documents/general/${d.id}`} className="text-blue-600 hover:underline text-xs me-3">عرض</Link>
                    <Link href={`/documents/general/${d.id}/edit`} className="text-indigo-600 hover:underline text-xs me-3">تعديل</Link>
                    <button onClick={() => { if (confirm('حذف هذا المستند؟')) deleteMutation.mutate(d.id); }}
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
