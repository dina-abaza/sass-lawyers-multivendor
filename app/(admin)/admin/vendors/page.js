'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

function ExportBtn({ label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#E2E6F0] rounded-lg hover:bg-[#F8F9FC] text-[#4A5568] transition-colors font-medium">
      {label}
    </button>
  );
}

const inputCls = 'border border-[#E2E6F0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] bg-white transition-colors';

export default function AdminVendorsPage() {
  const qc = useQueryClient();
  const [search,  setSearch]  = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page,    setPage]    = useState(1);

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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pending-vendors.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-1">لوحة المدير</p>
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>مكاتب قيد الانتظار</h1>
          <p className="text-white/50 text-sm mt-1">الطلبات المعلقة التي تحتاج موافقة</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-[#F0F2F7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ExportBtn label="نسخ"   onClick={copyTable} />
            <ExportBtn label="CSV"   onClick={downloadCSV} />
            <ExportBtn label="إكسيل" onClick={downloadCSV} />
            <ExportBtn label="طباعة" onClick={() => window.print()} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#8896A7]">
              <span>إظهار</span>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className={inputCls}>
                {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>سجل</span>
            </div>
            <div className="relative">
              <input type="text" placeholder="بحث..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className={`${inputCls} ps-8 w-44`} />
              <svg className="w-4 h-4 text-[#8896A7] absolute top-2 start-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <thead className="bg-[#F8F9FC] border-b border-[#E2E6F0]">
                <tr>
                  {['الاسم', 'البريد الإلكتروني', 'اسم المكتب المطلوب', 'تاريخ الطلب', 'الإجراءات'].map((h) => (
                    <th key={h} className="px-4 py-3 text-right font-semibold text-[#4A5568] text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-14 text-[#8896A7]">
                      {rawList.length === 0 ? 'لا توجد طلبات قيد الانتظار' : 'لا توجد نتائج للبحث'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((v) => (
                    <tr key={v.id} className="hover:bg-[#F8F9FC] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EBF0FA] flex items-center justify-center text-[#081A3A] font-bold text-xs shrink-0">
                            {(v.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#0A1628]">{v.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#4A5568] text-xs">{v.email}</td>
                      <td className="px-4 py-3.5 text-[#4A5568]">{v.requested_tenant_name || '—'}</td>
                      <td className="px-4 py-3.5 text-[#8896A7] text-xs">{v.created_at?.substring(0, 10) || '—'}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveMutation.mutate(v.id)}
                            disabled={approveMutation.isPending}
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="قبول">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { if (confirm(`رفض طلب "${v.name}"؟`)) rejectMutation.mutate(v.id); }}
                            disabled={rejectMutation.isPending}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="رفض">
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
          <div className="px-4 py-3 border-t border-[#F0F2F7] flex items-center justify-between text-sm text-[#8896A7]">
            <span className="text-xs">
              عرض {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} من {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-[#E2E6F0] rounded-lg disabled:opacity-40 hover:bg-[#F8F9FC] transition-colors">
                التالي
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    page === n ? 'text-white shadow-sm' : 'border border-[#E2E6F0] hover:bg-[#F8F9FC]'
                  }`}
                  style={page === n ? { background: 'linear-gradient(135deg, #081A3A, #0D2452)' } : {}}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-[#E2E6F0] rounded-lg disabled:opacity-40 hover:bg-[#F8F9FC] transition-colors">
                السابق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
