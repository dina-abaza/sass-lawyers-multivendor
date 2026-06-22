'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { contractsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

export default function ContractDetailPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });

  const contract = data?.data ?? data;

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError || !contract) return (
    <div className="p-6 text-center text-gray-500">
      <p>تعذر تحميل بيانات العقد</p>
      <button onClick={() => router.back()} className="mt-3 text-blue-600 hover:underline text-sm">رجوع</button>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل العقد</h1>
        <div className="mr-auto">
          <Link href={`/contracts/${id}/edit`}
            className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
            تعديل
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="px-6 py-4 flex justify-between">
          <span className="text-sm text-gray-500">رقم العقد</span>
          <span className="text-sm font-mono font-medium text-gray-900">{contract.contract_number || `#${contract.id}`}</span>
        </div>
        {contract.name && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">اسم العقد</span>
            <span className="text-sm font-medium text-gray-900">{contract.name}</span>
          </div>
        )}
        {contract.customer && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">العميل</span>
            <span className="text-sm font-medium text-gray-900">{contract.customer?.name || contract.customer_id}</span>
          </div>
        )}
        {contract.start_date && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">تاريخ البداية</span>
            <span className="text-sm font-medium text-gray-900">{String(contract.start_date).substring(0, 10)}</span>
          </div>
        )}
        {contract.end_date && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">تاريخ الانتهاء</span>
            <span className="text-sm font-medium text-gray-900">{String(contract.end_date).substring(0, 10)}</span>
          </div>
        )}
        {contract.value != null && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">قيمة العقد</span>
            <span className="text-sm font-medium text-gray-900">{Number(contract.value).toLocaleString()} ر.س</span>
          </div>
        )}
        {contract.notes && (
          <div className="px-6 py-4">
            <span className="text-sm text-gray-500 block mb-1">ملاحظات</span>
            <p className="text-sm text-gray-800">{contract.notes}</p>
          </div>
        )}
        {contract.invoices && contract.invoices.length > 0 && (
          <div className="px-6 py-4">
            <span className="text-sm text-gray-500 block mb-2">الفواتير المرتبطة ({contract.invoices.length})</span>
            <div className="space-y-1">
              {contract.invoices.map((inv) => (
                <div key={inv.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">فاتورة #{inv.id}</span>
                  <span className="font-medium text-gray-900">{Number(inv.total_amount).toLocaleString()} ر.س</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <Link href={`/finance/contract-invoices/create?contract_id=${contract.id}`}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          إنشاء فاتورة
        </Link>
        <Link href="/contracts" className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
          قائمة العقود
        </Link>
      </div>
    </div>
  );
}
