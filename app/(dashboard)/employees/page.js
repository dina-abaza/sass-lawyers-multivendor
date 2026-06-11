'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function EmployeesPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: () => tenantApi.get('/employees').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tenantApi.delete(`/employees/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const employees = Array.isArray(data) ? data : data?.data ?? [];
  const filtered = employees.filter(
    (e) => e.name?.includes(search) || e.email?.includes(search) || e.department?.name_ar?.includes(search)
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الموظفون</h1>
          <p className="text-sm text-gray-500">{filtered.length} موظف</p>
        </div>
        <Link href="/employees/create">
          <Button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            موظف جديد
          </Button>
        </Link>
      </div>

      <div className="relative">
        <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full h-10 ps-9 pe-4 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="بحث بالاسم أو البريد الإلكتروني..."
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          لا يوجد موظفون
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الاسم</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">البريد الإلكتروني</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">القسم</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs">
                        {emp.name?.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600" dir="ltr">{emp.email}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.department?.name_ar ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/employees/${emp.id}`}>
                        <Button variant="ghost" size="sm">عرض</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
                            deleteMutation.mutate(emp.id);
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
