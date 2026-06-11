'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CustomersPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => tenantApi.get('/customers').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tenantApi.delete(`/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const customers = Array.isArray(data) ? data : data?.data ?? [];
  const filtered = customers.filter(
    (c) =>
      c.name?.includes(search) ||
      c.mobile?.includes(search) ||
      c.national_id?.includes(search)
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
          <p className="text-sm text-gray-500">{filtered.length} عميل</p>
        </div>
        <Link href="/customers/create">
          <Button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            عميل جديد
          </Button>
        </Link>
      </div>

      <div className="relative">
        <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full h-10 ps-9 pe-4 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="بحث بالاسم أو رقم الهاتف أو الهوية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorMessage error={error} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          لا يوجد عملاء
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الاسم</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">رقم الهوية</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الجوال</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">النوع</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.national_id}</td>
                  <td className="px-4 py-3 text-gray-600" dir="ltr">{c.mobile}</td>
                  <td className="px-4 py-3 text-gray-600">{c.customer_type ?? '—'}</td>
                  <td className="px-4 py-3">
                    {c.status && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{c.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/customers/${c.id}`}>
                        <Button variant="ghost" size="sm">عرض</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        loading={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
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
