'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { sessionsApi, casesApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Spinner from '@/components/common/Spinner';

export default function EditSessionPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });
  const { data: cases } = useQuery({
    queryKey: [QUERY_KEYS.CASES],
    queryFn: () => casesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });
  const { data: statuses } = useQuery({
    queryKey: [QUERY_KEYS.CASE_STATUSES],
    queryFn: () => casesApi.getStatuses(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });
  const { data: lawyers } = useQuery({
    queryKey: [QUERY_KEYS.LAWYERS],
    queryFn: () => casesApi.getLawyers(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  useEffect(() => {
    const s = data?.data ?? data;
    if (s && !form) {
      setForm({
        case_id: s.case_id ?? '',
        user_id: s.user_id ?? '',
        case_status_id: s.case_status_id ?? '',
        session_number: s.session_number ?? '',
        court_side: s.court_side ?? '',
        agency: s.agency ?? '',
        day: s.day ?? '',
        date: s.date ?? '',
        date_hijri: s.date_hijri ?? '',
        session_time: s.session_time ?? '',
        reminder_date: s.reminder_date ?? '',
        notes: s.notes ?? '',
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (data) => sessionsApi.update(tenantApi, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session', id] });
      qc.invalidateQueries({ queryKey: ['sessions'] });
      router.push(`/sessions/${id}`);
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading || !form) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/sessions/${id}`}><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">تعديل الجلسة</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <ErrorMessage error={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="القضية" name="case_id" value={String(form.case_id)} onChange={handleChange} options={toOptions(cases, (x) => x.case_number || `#${x.id}`)} required />
          <Select label="المحامي" name="user_id" value={String(form.user_id)} onChange={handleChange} options={toOptions(lawyers)} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="حالة القضية" name="case_status_id" value={String(form.case_status_id)} onChange={handleChange} options={toOptions(statuses)} required />
          <Input label="رقم الجلسة" name="session_number" value={form.session_number} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الجهة القضائية" name="court_side" value={form.court_side} onChange={handleChange} />
          <Input label="الجهة" name="agency" value={form.agency} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ الجلسة" name="date" type="date" value={form.date} onChange={handleChange} required />
          <Input label="التاريخ الهجري" name="date_hijri" value={form.date_hijri} onChange={handleChange} placeholder="1446/06/15" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="وقت الجلسة" name="session_time" type="time" value={form.session_time} onChange={handleChange} />
          <Input label="اليوم" name="day" value={form.day} onChange={handleChange} placeholder="الإثنين" />
        </div>

        <Input label="تاريخ التذكير" name="reminder_date" type="date" value={form.reminder_date} onChange={handleChange} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea name="notes" rows={3} value={form.notes} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ التعديلات</Button>
          <Link href={`/sessions/${id}`}><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
