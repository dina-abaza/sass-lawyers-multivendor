'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { contractsApi, customersApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateContractPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', contract_number: '', customer_id: '',
    start_date: '', end_date: '', value: '',
  });
  const [error, setError] = useState(null);

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => contractsApi.create(tenantApi, data),
    onSuccess: () => router.push('/contracts'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toOptions(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((x) => ({ value: x.id, label: x.name }));
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/contracts"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">عقد جديد</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="اسم العقد" name="name" value={form.name} onChange={handleChange} required />
          <Input label="رقم العقد" name="contract_number" value={form.contract_number} onChange={handleChange} required />
        </div>
        <Select label="العميل" name="customer_id" value={form.customer_id} onChange={handleChange} options={toOptions(customers)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ البداية" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
          <Input label="تاريخ النهاية" name="end_date" type="date" value={form.end_date} onChange={handleChange} required />
        </div>
        <Input label="قيمة العقد" name="value" type="number" value={form.value} onChange={handleChange} required />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ العقد</Button>
          <Link href="/contracts"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
