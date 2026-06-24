'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { invoicesApi, casesApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateInvoicePage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ case_id: '', amount: '' });
  const [error, setError] = useState(null);

  const { data: cases } = useQuery({
    queryKey: [QUERY_KEYS.CASES],
    queryFn: () => casesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => invoicesApi.create(tenantApi, data),
    onSuccess: () => router.push('/finance/invoices'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="p-6 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/finance/invoices"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">فاتورة جديدة</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />
        <Select label="القضية" name="case_id" value={form.case_id} onChange={handleChange} options={toOptions(cases, (x) => x.case_number || String(x.id))} required />
        <Input label="المبلغ" name="amount" type="number" value={form.amount} onChange={handleChange} required />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>إصدار الفاتورة</Button>
          <Link href="/finance/invoices"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
