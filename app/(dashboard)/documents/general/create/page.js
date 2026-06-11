'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { generalDocsApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateGeneralDocPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ file_type: '', description: '', notes: '' });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('files[]', f));
      return generalDocsApi.create(tenantApi, fd);
    },
    onSuccess: () => router.push('/documents/general'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/documents/general"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">مستند عام جديد</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />
        <Input label="نوع الملف" name="file_type" value={form.file_type} onChange={handleChange} required />
        <Input label="الوصف" name="description" value={form.description} onChange={handleChange} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">الملفات</label>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))}
            className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-white hover:file:bg-gray-50" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ المستند</Button>
          <Link href="/documents/general"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
