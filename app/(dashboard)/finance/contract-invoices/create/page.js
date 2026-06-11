'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { invoicesApi, contractsApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateContractInvoicePage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ contract_id: '', amount: '' });
  const [error, setError] = useState(null);

  const { data: contracts } = useQuery({
    queryKey: ['contracts-list'],
    queryFn: () => contractsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => invoicesApi.createContractInvoice(tenantApi, data),
    onSuccess: () => router.push('/finance/contract-invoices'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toOptions(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((x) => ({ value: x.id, label: x.name || x.contract_number }));
  }

  return (
    <div className="p-6 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/finance/contract-invoices"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">فاتورة عقد جديدة</h1>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />
        <Select label="العقد" name="contract_id" value={form.contract_id} onChange={handleChange} options={toOptions(contracts)} required />
        <Input label="المبلغ" name="amount" type="number" value={form.amount} onChange={handleChange} required />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>إصدار الفاتورة</Button>
          <Link href="/finance/contract-invoices"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
