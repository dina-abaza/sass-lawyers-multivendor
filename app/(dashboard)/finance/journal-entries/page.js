'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

export default function JournalEntriesPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => accountsApi.getJournalEntries(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => accountsApi.deleteJournalEntry(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal-entries'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 10h18M3 14h18M10 6H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-3" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المالية</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>القيود اليومية</h1>
            </div>
          </div>
          <Link href="/finance/journal-entries/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            قيد جديد
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <p className="text-[#8896A7] text-sm">لا توجد قيود مسجلة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F7]">
                <div>
                  <p className="font-semibold text-[#0A1628]">{entry.description}</p>
                  <p className="text-xs text-[#8896A7] mt-0.5">{entry.entry_date}</p>
                </div>
                <button onClick={() => { if (confirm('حذف هذا القيد؟')) deleteMutation.mutate(entry.id); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ background: '#F0F4FA' }}>
                    <tr>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-[#4A5568] uppercase tracking-wide">الحساب</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-[#4A5568] uppercase tracking-wide">البيان</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-[#4A5568] uppercase tracking-wide">مدين</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-[#4A5568] uppercase tracking-wide">دائن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F7]">
                    {(entry.items || []).map((item, i) => (
                      <tr key={i} className="hover:bg-[#F8F9FC] transition-colors">
                        <td className="px-4 py-2.5 text-[#0A1628] font-medium">{item.account?.name || item.account_id}</td>
                        <td className="px-4 py-2.5 text-[#8896A7] text-xs">{item.description || '—'}</td>
                        <td className="px-4 py-2.5 text-[#0A1628]">{Number(item.debit) > 0 ? Number(item.debit).toLocaleString() : '—'}</td>
                        <td className="px-4 py-2.5 text-[#0A1628]">{Number(item.credit) > 0 ? Number(item.credit).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
