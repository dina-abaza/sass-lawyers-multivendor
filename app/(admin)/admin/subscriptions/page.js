'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Link from 'next/link';

function ExportBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
    >
      {label}
    </button>
  );
}

export default function AdminSubscriptionsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // GET /api/subscriptions → قائمة الباقات (Subscription Plans)
  const { data, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsApi.getAll().then((r) => r.data),
  });

  // DELETE /api/subscriptions/{id}
  const deleteMutation = useMutation({
    mutationFn: (id) => subscriptionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription-plans'] }),
  });

  const allPlans = useMemo(() => {
    return Array.isArray(data) ? data : (data?.data ?? []);
  }, [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allPlans;
    const q = search.toLowerCase();
    return allPlans.filter((p) => p.name?.toLowerCase().includes(q));
  }, [allPlans, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  function copyTable() {
    const rows = allPlans.map((p) =>
      `${p.name}\t${p.price_monthly} رس\t${p.price_yearly} رس\t${p.trial_days} يوم\t${p.max_users}\t${p.max_clients}\t${p.max_cases}`
    );
    navigator.clipboard.writeText(rows.join('\n'));
  }

  function downloadCSV() {
    const header = 'اسم الباقة,السعر الشهري,السعر السنوي,أيام التجربة,المستخدمين,العملاء,القضايا\n';
    const rows = allPlans.map((p) =>
      `"${p.name}",${p.price_monthly},${p.price_yearly},${p.trial_days},${p.max_users},${p.max_clients},${p.max_cases}`
    );
    const blob = new Blob(['﻿' + header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'packages.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDelete(id, name) {
    if (confirm(`هل تريد حذف باقة "${name}"؟`)) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الباقات</h1>
        <Link
          href="/admin/subscriptions/create"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة باقة
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ExportBtn label="نسخ"    onClick={copyTable} />
            <ExportBtn label="CSV"    onClick={downloadCSV} />
            <ExportBtn label="إكسيل"  onClick={downloadCSV} />
            <ExportBtn label="طباعة"  onClick={() => window.print()} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>إظهار</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>السجلات</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="بحث..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-1.5 ps-8 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg className="w-4 h-4 text-gray-400 absolute top-2 start-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">#</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">اسم الباقة</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">السعر الشهري</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">السعر السنوي</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">أيام التجربة</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">المستخدمين</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">العملاء</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">القضايا</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">لا توجد باقات</td>
                  </tr>
                ) : (
                  paginated.map((plan, i) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{(page - 1) * perPage + i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td>
                      <td className="px-4 py-3 text-gray-700">{plan.price_monthly} رس</td>
                      <td className="px-4 py-3 text-gray-700">{plan.price_yearly} رس</td>
                      <td className="px-4 py-3 text-gray-700">{plan.trial_days} يوم</td>
                      <td className="px-4 py-3 text-gray-700">{plan.max_users}</td>
                      <td className="px-4 py-3 text-gray-700">{plan.max_clients}</td>
                      <td className="px-4 py-3 text-gray-700">{plan.max_cases}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
                          <Link
                            href={`/admin/subscriptions/${plan.id}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                            title="عرض"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          {/* Edit */}
                          <Link
                            href={`/admin/subscriptions/${plan.id}/edit`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="تعديل"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(plan.id, plan.name)}
                            disabled={deleteMutation.isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="حذف"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              عرض {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} من {filtered.length} سجل
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                التالي
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    page === n ? 'bg-purple-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                السابق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
