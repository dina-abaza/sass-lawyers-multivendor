'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { departmentsApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateDepartmentPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name_ar: '', name_en: '' });
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: (data) => departmentsApi.create(tenantApi, data),
    onSuccess: () => router.push('/departments'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="p-6 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/departments"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">قسم جديد</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />
        <Input label="الاسم بالعربية" name="name_ar" value={form.name_ar} onChange={handleChange} required />
        <Input label="الاسم بالإنجليزية" name="name_en" value={form.name_en} onChange={handleChange} dir="ltr" />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ القسم</Button>
          <Link href="/departments"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
