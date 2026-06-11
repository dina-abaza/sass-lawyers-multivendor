'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const STATUS_COLORS = {
  نشطة: 'bg-green-100 text-green-700',
  ارشيف: 'bg-gray-100 text-gray-600',
  متوقفة: 'bg-yellow-100 text-yellow-700',
};

export default function CasesPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['cases'],
    queryFn: () => tenantApi.get('/cases').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tenantApi.delete(`/cases/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cases'] }),
  });

  const cases = Array.isArray(data) ? data : data?.data ?? [];
  const filtered = cases.filter(
    (c) =>
      c.case_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.customer?.name?.includes(search) ||
      c.subject?.includes(search)
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">القضايا</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} قضية</p>
        </div>
        <Link href="/cases/create">
          <Button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            قضية جديدة
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full h-10 ps-9 pe-4 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="بحث برقم القضية أو اسم العميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorMessage error={error} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          لا توجد قضايا
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">رقم القضية</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">العميل</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الموضوع</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">التاريخ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-blue-700">{c.case_number}</td>
                  <td className="px-4 py-3 text-gray-700">{c.customer?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{c.subject ?? '—'}</td>
                  <td className="px-4 py-3">
                    {c.status?.name ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status.name] ?? 'bg-gray-100 text-gray-600'}`}>
                        {c.status.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.date ? new Date(c.date).toLocaleDateString('ar-SA') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/cases/${c.id}`}>
                        <Button variant="ghost" size="sm">عرض</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        loading={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذه القضية؟')) {
                            deleteMutation.mutate(c.id);
                          }
                        }}
                      >
                        حذف
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
