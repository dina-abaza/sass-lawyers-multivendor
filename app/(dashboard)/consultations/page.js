'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { consultationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function ConsultationsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => consultationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => consultationsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consultations'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  const typeLabel = { oral: 'شفهية', written: 'مكتوبة' };
  const classLabel = { commercial: 'تجارية', civil: 'مدنية', criminal: 'جنائية', family: 'أسرة' };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الاستشارات القانونية</h1>
        <Link href="/consultations/create"><Button>+ استشارة جديدة</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد استشارات مسجلة</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">العميل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الموضوع</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">النوع</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">التصنيف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المبلغ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.customer?.name || c.customer_id}</td>
                  <td className="px-4 py-3 text-gray-600">{c.subject}</td>
                  <td className="px-4 py-3 text-gray-600">{typeLabel[c.consultation_type] || c.consultation_type}</td>
                  <td className="px-4 py-3 text-gray-600">{classLabel[c.general_classification] || c.general_classification}</td>
                  <td className="px-4 py-3 text-gray-600">{c.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-left">
                    <Link href={`/consultations/${c.id}`} className="text-blue-600 hover:underline text-xs me-3">عرض</Link>
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
