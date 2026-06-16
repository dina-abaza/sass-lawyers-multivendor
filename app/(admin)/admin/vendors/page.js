'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

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

export default function AdminVendorsPage() {
  const qc = useQueryClient();
  const [search,  setSearch]  = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page,    setPage]    = useState(1);

  // GET /api/admin/pending-vendors
  const { data, isLoading } = useQuery({
    queryKey: ['pending-vendors'],
    queryFn: () => adminApi.getPendingVendors().then((r) => r.data),
  });

  // POST /api/admin/approve-vendor/{userId}
  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-vendors'] }),
  });

  // POST /api/admin/reject-vendor/{userId}
  const rejectMutation = useMutation({
    mutationFn: (id) => adminApi.rejectVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-vendors'] }),
  });

  const rawList = Array.isArray(data) ? data : (data?.data ?? []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rawList;
    const q = search.toLowerCase();
    return rawList.filter(
      (v) =>
        v.name?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.requested_tenant_name?.toLowerCase().includes(q)
    );
  }, [rawList, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  function copyTable() {
    const rows = rawList.map((v) =>
      `${v.name}\t${v.email}\t${v.requested_tenant_name || ''}\t${v.created_at?.substring(0, 10) || ''}`
    );
    navigator.clipboard.writeText(rows.join('\n'));
  }

  function downloadCSV() {
    const header = 'الاسم,البريد الإلكتروني,اسم المكتب المطلوب,تاريخ الطلب\n';
    const rows = rawList.map((v) =>
      `"${v.name}","${v.email}","${v.requested_tenant_name || ''}","${v.created_at?.substring(0, 10) || ''}"`
    );
    const blob = new Blob(['﻿' + header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'pending-vendors.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">محامين قيد الانتظار</h1>

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
                type="text" placeholder="بحث..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-1.5 ps-8 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الاسم</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">البريد الإلكتروني</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">اسم المكتب المطلوب ↑↓</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ الطلب ↑↓</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      {rawList.length === 0 ? 'لا توجد طلبات قيد الانتظار' : 'لا توجد نتائج للبحث'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{v.email}</td>
                      <td className="px-4 py-3 text-gray-700">{v.requested_tenant_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{v.created_at?.substring(0, 10) || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Approve */}
                          <button
                            onClick={() => approveMutation.mutate(v.id)}
                            disabled={approveMutation.isPending}
                            className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="قبول"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          {/* Reject */}
                          <button
                            onClick={() => { if (confirm(`رفض طلب "${v.name}"؟`)) rejectMutation.mutate(v.id); }}
                            disabled={rejectMutation.isPending}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="رفض"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                  key={n} onClick={() => setPage(n)}
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
