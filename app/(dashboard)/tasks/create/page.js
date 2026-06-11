'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { tasksApi, employeesApi, casesApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const TASK_TYPES = [{ value: 'internal', label: 'داخلية' }, { value: 'external', label: 'خارجية' }];
const TASK_STATUSES = [
  { value: 'pending', label: 'معلقة' },
  { value: 'in_progress', label: 'جارية' },
  { value: 'completed', label: 'مكتملة' },
];

export default function CreateTaskPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', employee_id: '', case_id: '', type: '', status: 'pending',
    date: '', time: '', notes: '',
  });
  const [error, setError] = useState(null);

  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => employeesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });
  const { data: cases } = useQuery({
    queryKey: ['cases-list'],
    queryFn: () => casesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => tasksApi.create(tenantApi, data),
    onSuccess: () => router.push('/tasks'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toOptions(raw, labelFn) {
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((x) => ({ value: x.id, label: labelFn(x) }));
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tasks"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">مهمة جديدة</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <Input label="اسم المهمة" name="name" value={form.name} onChange={handleChange} required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="الموظف" name="employee_id" value={form.employee_id} onChange={handleChange} options={toOptions(employees, (x) => x.name)} />
          <Select label="القضية" name="case_id" value={form.case_id} onChange={handleChange} options={toOptions(cases, (x) => x.case_number || x.id)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="النوع" name="type" value={form.type} onChange={handleChange} options={TASK_TYPES} />
          <Select label="الحالة" name="status" value={form.status} onChange={handleChange} options={TASK_STATUSES} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="التاريخ" name="date" type="date" value={form.date} onChange={handleChange} required />
          <Input label="الوقت" name="time" type="time" value={form.time} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ المهمة</Button>
          <Link href="/tasks"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
