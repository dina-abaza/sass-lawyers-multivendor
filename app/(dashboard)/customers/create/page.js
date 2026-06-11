'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const GENDER_OPTIONS = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
];

const TYPE_OPTIONS = [
  { value: 'individual', label: 'فرد' },
  { value: 'company', label: 'شركة' },
];

export default function CreateCustomerPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    national_id: '',
    email: '',
    mobile: '',
    phone: '',
    customer_type: '',
    gender: '',
    job: '',
    address: '',
    birth_date: '',
    notes: '',
    status: '',
  });
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: (data) => tenantApi.post('/customers', data),
    onSuccess: () => router.push('/customers'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(form);
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/customers">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">عميل جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الاسم الكامل" name="name" value={form.name} onChange={handleChange} required />
          <Input label="رقم الهوية" name="national_id" value={form.national_id} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الجوال" name="mobile" type="tel" value={form.mobile} onChange={handleChange} required dir="ltr" />
          <Input label="الهاتف" name="phone" type="tel" value={form.phone} onChange={handleChange} dir="ltr" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="البريد الإلكتروني" name="email" type="email" value={form.email} onChange={handleChange} dir="ltr" />
          <Input label="المهنة" name="job" value={form.job} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="النوع" name="customer_type" value={form.customer_type} onChange={handleChange} options={TYPE_OPTIONS} />
          <Select label="الجنس" name="gender" value={form.gender} onChange={handleChange} options={GENDER_OPTIONS} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ الميلاد" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />
          <Input label="العنوان" name="address" value={form.address} onChange={handleChange} />
        </div>

        <Textarea label="ملاحظات" name="notes" value={form.notes} onChange={handleChange} />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ العميل</Button>
          <Link href="/customers"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
