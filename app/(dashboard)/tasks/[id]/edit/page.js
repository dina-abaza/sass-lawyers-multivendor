'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { tasksApi, employeesApi, casesApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS, TASK_TYPE_OPTIONS, TASK_STATUS_OPTIONS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/common/ErrorMessage';
import Spinner from '@/components/common/Spinner';

const labelCls = 'block text-xs font-semibold text-[#4A5568] mb-1.5';
const fieldCls = 'w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors resize-none';

export default function EditTaskPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });

  const { data: employees } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES],
    queryFn: () => employeesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: cases } = useQuery({
    queryKey: [QUERY_KEYS.CASES],
    queryFn: () => casesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  useEffect(() => {
    const t = data?.data ?? data;
    if (t && !form) {
      setForm({
        name:        t.name        ?? '',
        employee_id: t.employee_id ?? '',
        case_id:     t.case_id     ?? '',
        type:        t.type        ?? '',
        status:      t.status      ?? 'active',
        date:        t.date        ?? '',
        date_hijri:  t.date_hijri  ?? '',
        time:        t.time        ?? '',
        notes:       t.notes       ?? '',
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (payload) => tasksApi.update(tenantApi, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks-archive'] });
      router.push('/tasks');
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading || !form) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">

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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المهام</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>تعديل المهمة</h1>
            </div>
          </div>
          <Link href="/tasks"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            رجوع
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <div className="w-full h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #D4AF37, #B8961F)' }} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }} className="space-y-5">
          <ErrorMessage error={error} />

          <Input label="اسم المهمة" name="name" value={form.name} onChange={handleChange} required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="الموظف" name="employee_id" value={String(form.employee_id)} onChange={handleChange}
              options={toOptions(employees, (x) => x.name)} required />
            <Select label="القضية" name="case_id" value={String(form.case_id)} onChange={handleChange}
              options={toOptions(cases, (x) => x.case_number || `#${x.id}`)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="النوع" name="type" value={form.type} onChange={handleChange}
              options={TASK_TYPE_OPTIONS} required />
            <Select label="الحالة" name="status" value={form.status} onChange={handleChange}
              options={TASK_STATUS_OPTIONS} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="التاريخ الميلادي" name="date" type="date" value={form.date} onChange={handleChange} />
            <Input label="التاريخ الهجري" name="date_hijri" value={form.date_hijri} onChange={handleChange} placeholder="1446/06/15" />
          </div>

          <Input label="الوقت" name="time" type="time" value={form.time} onChange={handleChange} />

          <div>
            <label className={labelCls}>ملاحظات</label>
            <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} className={fieldCls} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
              {mutation.isPending
                ? <span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              حفظ التعديلات
            </button>
            <Link href="/tasks"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
