'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { wakalasApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function WakalasPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wakalas'],
    queryFn: () => wakalasApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => wakalasApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wakalas'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">التوكيلات</h1>
        <Link href="/wakalas/create"><Button>+ توكيل جديد</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد توكيلات مسجلة</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">رقم التوكيل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ الإصدار</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ الانتهاء</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{w.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{w.wakala_number}</td>
                  <td className="px-4 py-3 text-gray-600">{w.wakala_date_hijri}</td>
                  <td className="px-4 py-3 text-gray-600">{w.wakala_expiry_hijri}</td>
                  <td className="px-4 py-3 text-left">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => router.push(`/wakalas/${w.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800 text-xs">تعديل</button>
                      <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(w.id); }}
                        className="text-red-600 hover:text-red-800 text-xs">حذف</button>
                    </div>
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
