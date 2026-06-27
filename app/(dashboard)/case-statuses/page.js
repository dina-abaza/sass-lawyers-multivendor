'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { casesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CaseStatusesPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['case-statuses'],
    queryFn: () => casesApi.getStatuses(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const createMutation = useMutation({
    mutationFn: () => casesApi.createStatus(tenantApi, { name }),
    onSuccess: () => { setName(''); qc.invalidateQueries({ queryKey: ['case-statuses'] }); },
    onError: setError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => casesApi.deleteStatus(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['case-statuses'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الإعدادات</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>حالات القضايا</h1>
            <p className="text-white/50 text-sm mt-0.5">إدارة حالات القضايا المتاحة في النظام</p>
          </div>
        </div>
      </div>

      {/* إضافة حالة */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          إضافة حالة جديدة
        </h2>
        <ErrorMessage error={error} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(); }}
          className="flex gap-3">
          <Input placeholder="اسم الحالة" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" loading={createMutation.isPending}>إضافة</Button>
        </form>
      </div>

      {/* قائمة الحالات */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Spinner /></div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] py-12 text-center shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FC] border border-[#E2E6F0] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#8896A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-[#8896A7]">لا توجد حالات بعد</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] overflow-hidden shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          {list.map((s, i) => (
            <div key={s.id}
              className={`flex items-center justify-between px-5 py-3.5 hover:bg-[#F8F9FC] transition-colors ${i !== list.length - 1 ? 'border-b border-[#F0F2F7]' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0" />
                <span className="text-[#0A1628] text-sm font-medium">{s.name}</span>
              </div>
              <button
                onClick={() => { if (confirm('حذف هذه الحالة؟')) deleteMutation.mutate(s.id); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
