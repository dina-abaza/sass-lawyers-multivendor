'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { invoicesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function ConsultingInvoicesPage() {
  const { tenantApi } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['consulting-invoices'],
    queryFn: () => invoicesApi.getConsultingInvoices(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">فواتير الاستشارات</h1>
          <p className="text-sm text-gray-500 mt-0.5">أتعاب الاستشارات القانونية المقدمة للعملاء</p>
        </div>
        <Link href="/finance/consulting-invoices/create"><Button>+ فاتورة استشارة جديدة</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد فواتير</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الاستشارة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المبلغ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الضريبة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الإجمالي</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{inv.id}</td>
                  <td className="px-4 py-3 text-gray-900">{inv.consultation?.subject || inv.consultation_id}</td>
                  <td className="px-4 py-3 font-medium">{Number(inv.amount).toLocaleString()} ر.س</td>
                  <td className="px-4 py-3 text-gray-600">{Number(inv.tax_value).toLocaleString()} ر.س <span className="text-xs text-gray-400">({inv.tax_rate}%)</span></td>
                  <td className="px-4 py-3 font-bold text-blue-700">{Number(inv.total_amount).toLocaleString()} ر.س</td>
                  <td className="px-4 py-3 text-gray-600">{inv.created_at?.substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
