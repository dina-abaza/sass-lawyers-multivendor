'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function ArchivePage() {
  const { tenantApi } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['cases-archive'],
    queryFn: () => tenantApi.get('/cases-archive').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const cases = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/cases">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">أرشيف القضايا</h1>
          <p className="text-sm text-gray-500">{cases.length} قضية مؤرشفة</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorMessage error={error} />
      ) : cases.length === 0 ? (
        <div className="text-center py-16 text-gray-400">لا توجد قضايا مؤرشفة</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">رقم القضية</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">العميل</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الموضوع</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">التاريخ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-blue-700">{c.case_number}</td>
                  <td className="px-4 py-3 text-gray-700">{c.customer?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{c.subject ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.date ? new Date(c.date).toLocaleDateString('ar-SA') : '—'}</td>
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`}>
                      <Button variant="ghost" size="sm">عرض</Button>
                    </Link>
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
