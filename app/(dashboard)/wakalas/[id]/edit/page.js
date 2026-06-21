'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { wakalasApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function EditWakalaPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', wakala_expiry_hijri: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['wakalas', id],
    queryFn: () => wakalasApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });

  useEffect(() => {
    const wakala = data?.data ?? data;
    if (wakala) {
      setForm({
        name: wakala.name || '',
        wakala_expiry_hijri: wakala.wakala_expiry_hijri || '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('_method', 'PUT');
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      return wakalasApi.update(tenantApi, id, fd);
    },
    onSuccess: () => router.push('/wakalas'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/wakalas"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">تعديل التوكيل</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        <ErrorMessage error={error} />

        <Input label="الاسم" name="name" value={form.name} onChange={handleChange} required />
        <Input
          label="تاريخ الانتهاء (هجري)"
          name="wakala_expiry_hijri"
          value={form.wakala_expiry_hijri}
          onChange={handleChange}
          placeholder="1450/01/10"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملف التوكيل (اختياري)</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-white hover:file:bg-gray-50"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ التعديلات</Button>
          <Link href="/wakalas"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
