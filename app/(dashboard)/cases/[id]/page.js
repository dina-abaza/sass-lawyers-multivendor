'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { casesApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import Spinner from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

export default function CaseDetailPage({ params }) {
  const { id } = use(params);
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  const { data: legalCase, isLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => tenantApi.get(`/cases/${id}`).then((r) => r.data),
    enabled: !!tenantApi,
    onSuccess: (d) => setForm(d),
  });

  const { data: statuses } = useQuery({
    queryKey: [QUERY_KEYS.CASE_STATUSES],
    queryFn: () => casesApi.getStatuses(tenantApi).then((r) => r.data),
    enabled: !!tenantApi && editing,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => tenantApi.post(`/cases-updated/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['case', id] });
      qc.invalidateQueries({ queryKey: ['cases'] });
      setEditing(false);
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  if (!legalCase) return null;

  const displayCase = form || legalCase;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">

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
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">القضايا</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>
                {editing ? 'تعديل القضية' : `قضية رقم ${legalCase.case_number}`}
              </h1>
              {!editing && legalCase.status?.name && (
                <p className="text-white/50 text-sm mt-0.5">{legalCase.status.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/cases"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </Link>
            {!editing && (
              <button onClick={() => { setForm({ ...legalCase }); setEditing(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                تعديل
              </button>
            )}
          </div>
        </div>
      </div>

      <ErrorMessage error={error} />

      {/* Content */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-5 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          بيانات القضية
        </h2>

        {editing ? (
          <form className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); setError(null); updateMutation.mutate(form); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="رقم القضية" name="case_number" value={form?.case_number || ''} onChange={handleChange} />
              <Input label="التاريخ" name="date" type="date" value={form?.date?.slice(0, 10) || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الجهة" name="agency" value={form?.agency || ''} onChange={handleChange} />
              <Input label="المحكمة" name="office" value={form?.office || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الخصم" name="opponent_name" value={form?.opponent_name || ''} onChange={handleChange} />
              <Input label="قيمة القضية" name="value" type="number" value={form?.value || ''} onChange={handleChange} />
            </div>
            <Select label="الحالة" name="case_status_id" value={form?.case_status_id || ''}
              onChange={handleChange} options={toOptions(statuses)} />
            <Input label="الموضوع" name="subject" value={form?.subject || ''} onChange={handleChange} />
            <Textarea label="ملاحظات" name="notes" value={form?.notes || ''} onChange={handleChange} />
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
                {updateMutation.isPending
                  ? <span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" />
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                حفظ التغييرات
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
                إلغاء
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {[
              { label: 'رقم القضية',  value: legalCase.case_number },
              { label: 'العميل',       value: legalCase.customer?.name },
              { label: 'الحالة',       value: legalCase.status?.name },
              { label: 'التاريخ',      value: legalCase.date ? new Date(legalCase.date).toLocaleDateString('ar-SA') : null },
              { label: 'الجهة',        value: legalCase.agency },
              { label: 'المحكمة',      value: legalCase.office },
              { label: 'الخصم',        value: legalCase.opponent_name },
              { label: 'قيمة القضية', value: legalCase.value ? `${legalCase.value} ر.س` : null },
              { label: 'الموضوع',      value: legalCase.subject },
              { label: 'ملاحظات',     value: legalCase.notes },
            ].map(({ label, value }) => (
              <div key={label} className="border-b border-[#F0F2F7] pb-4 last:border-0 last:pb-0">
                <dt className="text-xs text-[#8896A7] mb-1.5 font-medium">{label}</dt>
                <dd className="text-sm font-semibold text-[#0A1628]">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
