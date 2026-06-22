'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { legalDocsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

const DOC_TYPES = {
  general_agency:  'وكالة عامة',
  special_agency:  'وكالة خاصة',
  periodic_agency: 'وكالة دورية - عدلية',
  declaration:     'إقرار',
  debt_settlement: 'سداد دين',
  legal_pledge:    'تعهد عدلي',
  ownership_deed:  'صك ملكية',
  other:           'أخرى',
};

export default function LegalDocumentsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['legal-documents'],
    queryFn: () => legalDocsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => legalDocsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['legal-documents'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">المستندات القانونية</h1>
        <Link href="/documents/legal/create"><Button>+ مستند جديد</Button></Link>
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
                <th className="px-4 py-3 text-right font-medium text-gray-600">العميل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">نوع المستند</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">رقم المستند</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">رقم الوكالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الملفات</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الوصف</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{d.customer?.name || `#${d.customer_id}`}</td>
                  <td className="px-4 py-3 text-gray-600">{DOC_TYPES[d.document_type] || d.document_type}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{d.document_number}</td>
                  <td className="px-4 py-3 text-gray-600">{d.agency_number || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {Array.isArray(d.files) && d.files.length > 0
                      ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{d.files.length} ملف</span>
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{d.description || '—'}</td>
                  <td className="px-4 py-3 text-left whitespace-nowrap">
                    <Link href={`/documents/legal/${d.id}`} className="text-blue-600 hover:underline text-xs me-3">عرض</Link>
                    <Link href={`/documents/legal/${d.id}/edit`} className="text-indigo-600 hover:underline text-xs me-3">تعديل</Link>
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
