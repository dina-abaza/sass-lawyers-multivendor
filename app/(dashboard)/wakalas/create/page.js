'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { wakalasApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateWakalaPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', wakala_number: '', wakala_date_hijri: '', wakala_expiry_hijri: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      return wakalasApi.create(tenantApi, fd);
    },
    onSuccess: () => router.push('/wakalas'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/wakalas"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">توكيل جديد</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <Input label="الاسم" name="name" value={form.name} onChange={handleChange} required />
        <Input label="رقم التوكيل" name="wakala_number" value={form.wakala_number} onChange={handleChange} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ الإصدار (هجري)" name="wakala_date_hijri" value={form.wakala_date_hijri} onChange={handleChange} placeholder="1447/01/10" />
          <Input label="تاريخ الانتهاء (هجري)" name="wakala_expiry_hijri" value={form.wakala_expiry_hijri} onChange={handleChange} placeholder="1450/01/10" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملف التوكيل</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0])}
            className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-white hover:file:bg-gray-50" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ التوكيل</Button>
          <Link href="/wakalas"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
