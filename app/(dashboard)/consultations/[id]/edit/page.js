'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { consultationsApi, customersApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS, CONSULTATION_TYPE_OPTIONS, CONSULTATION_CLASSIFICATION_OPTIONS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Spinner from '@/components/common/Spinner';

export default function EditConsultationPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: customers } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS],
    queryFn: () => customersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  useEffect(() => {
    const c = data?.data ?? data;
    if (c && !form) {
      setForm({
        customer_id: c.customer_id ?? '',
        consultation_type: c.consultation_type ?? '',
        general_classification: c.general_classification ?? '',
        subject: c.subject ?? '',
        amount: c.amount ?? '',
        notes: c.notes ?? '',
        description: c.description ?? '',
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (data) => consultationsApi.update(tenantApi, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultation', id] });
      qc.invalidateQueries({ queryKey: ['consultations'] });
      router.push(`/consultations/${id}`);
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading || !form) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/consultations/${id}`}><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">تعديل الاستشارة</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <ErrorMessage error={error} />

        <Select
          label="العميل"
          name="customer_id"
          value={String(form.customer_id)}
          onChange={handleChange}
          options={toOptions(customers)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="نوع الاستشارة"
            name="consultation_type"
            value={form.consultation_type}
            onChange={handleChange}
            options={CONSULTATION_TYPE_OPTIONS}
            required
          />
          <Select
            label="التصنيف العام"
            name="general_classification"
            value={form.general_classification}
            onChange={handleChange}
            options={CONSULTATION_CLASSIFICATION_OPTIONS}
            required
          />
        </div>

        <Input label="الموضوع" name="subject" value={form.subject} onChange={handleChange} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">الوصف</label>
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">الملاحظات</label>
          <textarea
            name="notes"
            rows={2}
            value={form.notes}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ التعديلات</Button>
          <Link href={`/consultations/${id}`}><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
