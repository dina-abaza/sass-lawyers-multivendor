'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { paymentVouchersApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function PaymentVouchersPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payment-vouchers'],
    queryFn: () => paymentVouchersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => paymentVouchersApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-vouchers'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">سندات الصرف</h1>
        <Link href="/finance/payment-vouchers/create"><Button>+ سند صرف جديد</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد سندات صرف</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">العميل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المبلغ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الغرض</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">بشيك</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{v.customer?.name || v.customer_id}</td>
                  <td className="px-4 py-3 font-medium text-red-700">{v.amount?.toLocaleString()} ر.س</td>
                  <td className="px-4 py-3 text-gray-600">{v.for_reason}</td>
                  <td className="px-4 py-3 text-gray-600">{v.voucher_date}</td>
                  <td className="px-4 py-3">{v.is_check ? '✓' : '-'}</td>
                  <td className="px-4 py-3 text-left">
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
