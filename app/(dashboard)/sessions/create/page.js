'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { sessionsApi, casesApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateSessionPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    case_id: '', case_status_id: '', session_number: '', court_side: '',
    agency: '', day: '', date: '', session_time: '', reminder_date: '', notes: '',
  });
  const [error, setError] = useState(null);

  const { data: cases } = useQuery({
    queryKey: ['cases-list'],
    queryFn: () => casesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });
  const { data: statuses } = useQuery({
    queryKey: ['case-statuses'],
    queryFn: () => casesApi.getStatuses(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => sessionsApi.create(tenantApi, data),
    onSuccess: () => router.push('/sessions'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toOptions(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((x) => ({ value: x.id, label: x.case_number || x.name || x.id }));
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sessions"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">جلسة جديدة</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="القضية" name="case_id" value={form.case_id} onChange={handleChange} options={toOptions(cases)} required />
          <Select label="حالة القضية" name="case_status_id" value={form.case_status_id} onChange={handleChange} options={toOptions(statuses)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="رقم الجلسة" name="session_number" value={form.session_number} onChange={handleChange} required />
          <Input label="الجهة القضائية" name="court_side" value={form.court_side} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الجهة" name="agency" value={form.agency} onChange={handleChange} />
          <Input label="اليوم" name="day" value={form.day} onChange={handleChange} placeholder="الإثنين" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ الجلسة" name="date" type="date" value={form.date} onChange={handleChange} required />
          <Input label="وقت الجلسة" name="session_time" type="time" value={form.session_time} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ التذكير" name="reminder_date" type="date" value={form.reminder_date} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ الجلسة</Button>
          <Link href="/sessions"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
