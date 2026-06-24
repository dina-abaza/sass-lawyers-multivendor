'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { vacationsApi, employeesApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateVacationPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ employee_id: '', start_date: '', end_date: '', notes: '' });
  const [error, setError] = useState(null);

  const { data: employees } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES],
    queryFn: () => employeesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => vacationsApi.create(tenantApi, data),
    onSuccess: () => router.push('/hr/vacations'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="p-6 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/hr/vacations"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">إجازة جديدة</h1>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />
        <Select label="الموظف" name="employee_id" value={form.employee_id} onChange={handleChange} options={toOptions(employees)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ البداية" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
          <Input label="تاريخ النهاية" name="end_date" type="date" value={form.end_date} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ الإجازة</Button>
          <Link href="/hr/vacations"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
