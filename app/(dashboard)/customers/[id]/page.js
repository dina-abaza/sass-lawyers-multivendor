'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { customersApi } from '@/lib/api';
import { GENDER_OPTIONS, CUSTOMER_TYPE_OPTIONS, CUSTOMER_STATUS_OPTIONS } from '@/lib/constants';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CustomerDetailPage({ params }) {
  const { id } = use(params);
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi,
    onSuccess: (d) => setForm(d),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => customersApi.update(tenantApi, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', id] });
      qc.invalidateQueries({ queryKey: ['customers'] });
      setEditing(false);
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading) return <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>;
  if (!customer) return null;

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => { setForm({ ...customer }); setEditing(true); }}>
            تعديل
          </Button>
        )}
      </div>

      <ErrorMessage error={error} />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {editing ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              updateMutation.mutate(form);
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الاسم" name="name" value={form?.name || ''} onChange={handleChange} />
              <Input label="رقم الهوية" name="national_id" value={form?.national_id || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الجوال" name="mobile" value={form?.mobile || ''} onChange={handleChange} dir="ltr" />
              <Input label="البريد" name="email" type="email" value={form?.email || ''} onChange={handleChange} dir="ltr" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="النوع" name="customer_type" value={form?.customer_type || ''} onChange={handleChange} options={CUSTOMER_TYPE_OPTIONS} />
              <Select label="الجنس" name="gender" value={form?.gender || ''} onChange={handleChange} options={GENDER_OPTIONS} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="الحالة" name="status" value={form?.status || ''} onChange={handleChange} options={CUSTOMER_STATUS_OPTIONS} />
              <Input label="العنوان" name="address" value={form?.address || ''} onChange={handleChange} />
            </div>
            <Textarea label="ملاحظات" name="notes" value={form?.notes || ''} onChange={handleChange} />
            <div className="flex gap-3">
              <Button type="submit" loading={updateMutation.isPending}>حفظ التغييرات</Button>
              <Button variant="outline" type="button" onClick={() => setEditing(false)}>إلغاء</Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              { label: 'الاسم', value: customer.name },
              { label: 'رقم الهوية', value: customer.national_id },
              { label: 'الجوال', value: customer.mobile },
              { label: 'البريد الإلكتروني', value: customer.email },
              { label: 'المهنة', value: customer.job },
              { label: 'الجنس', value: customer.gender === 'male' ? 'ذكر' : customer.gender === 'female' ? 'أنثى' : null },
              { label: 'النوع', value: customer.customer_type === 'individual' ? 'فرد' : customer.customer_type === 'company' ? 'شركة' : null },
              { label: 'العنوان', value: customer.address },
              { label: 'الحالة', value: customer.status === 'active' ? 'نشط' : customer.status === 'not_active' ? 'غير نشط' : null },
              { label: 'ملاحظات', value: customer.notes },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-gray-500 mb-1">{label}</dt>
                <dd className="text-sm font-medium text-gray-900">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Related cases */}
      {customer.cases?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">القضايا المرتبطة ({customer.cases.length})</h2>
          <div className="space-y-2">
            {customer.cases.map((c) => (
              <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-blue-700">{c.case_number}</span>
                <span className="text-xs text-gray-500">{c.status?.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
