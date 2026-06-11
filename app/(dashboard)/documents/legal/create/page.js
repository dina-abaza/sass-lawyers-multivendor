'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { legalDocsApi, customersApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const DOC_TYPE_OPTIONS = [
  { value: 'ownership_deed', label: 'سند ملكية' },
  { value: 'special_agency', label: 'وكالة خاصة' },
  { value: 'general_agency', label: 'وكالة عامة' },
  { value: 'contract', label: 'عقد' },
  { value: 'other', label: 'أخرى' },
];

export default function CreateLegalDocPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    customer_id: '', document_type: '', agency_number: '',
    document_number: '', description: '', notes: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('files[]', f));
      return legalDocsApi.create(tenantApi, fd);
    },
    onSuccess: () => router.push('/documents/legal'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toOptions(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((x) => ({ value: x.id, label: x.name }));
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/documents/legal"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">مستند قانوني جديد</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <Select label="العميل" name="customer_id" value={form.customer_id} onChange={handleChange} options={toOptions(customers)} required />
        <Select label="نوع المستند" name="document_type" value={form.document_type} onChange={handleChange} options={DOC_TYPE_OPTIONS} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="رقم الوكالة" name="agency_number" value={form.agency_number} onChange={handleChange} />
          <Input label="رقم المستند" name="document_number" value={form.document_number} onChange={handleChange} />
        </div>
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
          <Link href="/documents/legal"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
