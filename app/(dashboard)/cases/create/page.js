'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateCasePage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    case_number: '',
    customer_id: '',
    lawyer_id: '',
    case_status_id: '',
    subject: '',
    agency: '',
    office: '',
    type: '',
    value: '',
    opponent_name: '',
    notes: '',
    date: '',
  });
  const [error, setError] = useState(null);

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => tenantApi.get('/customers').then((r) => r.data),
    enabled: !!tenantApi,
  });
  const { data: statuses } = useQuery({
    queryKey: ['case-statuses'],
    queryFn: () => tenantApi.get('/case-statuses').then((r) => r.data),
    enabled: !!tenantApi,
  });
  const { data: lawyers } = useQuery({
    queryKey: ['lawyers'],
    queryFn: () => tenantApi.get('/lawyers').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => tenantApi.post('/cases', data),
    onSuccess: () => router.push('/cases'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    console.log('📋 القيم المُرسلة للسيرفر:', form);
    mutation.mutate(form);
  };

  function toOptions(arr) {
    if (!arr) return [];
    const list = Array.isArray(arr) ? arr : arr?.data ?? [];
    return list.map((item) => ({ value: item.id, label: item.name || item.case_number }));
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cases">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">قضية جديدة</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="رقم القضية" name="case_number" value={form.case_number} onChange={handleChange} required />
          <Input label="التاريخ" name="date" type="date" value={form.date} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="العميل" name="customer_id" value={form.customer_id} onChange={handleChange} options={toOptions(customers)} required />
          <Select label="المحامي" name="lawyer_id" value={form.lawyer_id} onChange={handleChange} options={toOptions(lawyers?.data ?? lawyers)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="الحالة" name="case_status_id" value={form.case_status_id} onChange={handleChange} options={toOptions(statuses)} required />
          <Input label="الجهة" name="agency" value={form.agency} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="المحكمة" name="office" value={form.office} onChange={handleChange} />
          <Input label="الخصم" name="opponent_name" value={form.opponent_name} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="قيمة القضية" name="value" type="number" value={form.value} onChange={handleChange} />
          <Input label="الموضوع" name="subject" value={form.subject} onChange={handleChange} />
        </div>

        <Textarea label="ملاحظات" name="notes" value={form.notes} onChange={handleChange} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ القضية</Button>
          <Link href="/cases"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
