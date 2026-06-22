'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { contractsApi, customersApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Spinner from '@/components/common/Spinner';

export default function EditContractPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  useEffect(() => {
    const contract = data?.data ?? data;
    if (contract && !form) {
      setForm({
        name: contract.name || '',
        contract_number: contract.contract_number || '',
        customer_id: contract.customer_id || '',
        start_date: contract.start_date ? String(contract.start_date).substring(0, 10) : '',
        end_date: contract.end_date ? String(contract.end_date).substring(0, 10) : '',
        value: contract.value ?? '',
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (payload) => contractsApi.update(tenantApi, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract', id] });
      qc.invalidateQueries({ queryKey: ['contracts'] });
      router.push(`/contracts/${id}`);
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toOptions(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((x) => ({ value: x.id, label: x.name }));
  }

  if (isLoading || !form) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/contracts/${id}`}><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">تعديل العقد</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <ErrorMessage error={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="اسم العقد" name="name" value={form.name} onChange={handleChange} required />
          <Input label="رقم العقد" name="contract_number" value={form.contract_number} onChange={handleChange} required />
        </div>
        <Select label="العميل" name="customer_id" value={form.customer_id} onChange={handleChange} options={toOptions(customers)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ البداية" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
          <Input label="تاريخ النهاية" name="end_date" type="date" value={form.end_date} onChange={handleChange} />
        </div>
        <Input label="قيمة العقد" name="value" type="number" value={form.value} onChange={handleChange} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ التعديلات</Button>
          <Link href={`/contracts/${id}`}><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
