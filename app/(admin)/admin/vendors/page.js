'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function AdminVendorsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['pending-vendors'],
    queryFn: () => adminApi.getPendingVendors().then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-vendors'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => adminApi.rejectVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-vendors'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">طلبات البائعين</h1>
        <p className="text-sm text-gray-500 mt-1">مراجعة طلبات التسجيل المعلقة والبت فيها</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">لا توجد طلبات معلقة</p>
          <p className="text-gray-400 text-sm mt-1">جميع الطلبات تمت معالجتها</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-yellow-700 font-medium">{list.length} طلب معلق بانتظار المراجعة</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ الطلب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs dir-ltr">{v.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{v.created_at?.substring(0, 10)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      معلق
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(v.id)}
                        loading={approveMutation.isPending}
                      >
                        موافقة
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { if (confirm('رفض هذا الطلب؟')) rejectMutation.mutate(v.id); }}
                        loading={rejectMutation.isPending}
                      >
                        رفض
                      </Button>
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
