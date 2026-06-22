'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { generalDocsApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Spinner from '@/components/common/Spinner';

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

export default function EditGeneralDocPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['general-document', id],
    queryFn: () => generalDocsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });

  useEffect(() => {
    const doc = data?.data ?? data;
    if (doc && !form) {
      setForm({
        file_type:   doc.file_type   ?? '',
        description: doc.description ?? '',
        notes:       doc.notes       ?? '',
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      newFiles.forEach((f) => fd.append('files[]', f));
      return generalDocsApi.update(tenantApi, id, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['general-documents'] });
      qc.invalidateQueries({ queryKey: ['general-document', id] });
      router.push(`/documents/general/${id}`);
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files);
    const oversized = selected.filter((f) => f.size > MAX_FILE_BYTES);
    if (oversized.length > 0) {
      oversized.forEach((f) =>
        toast.warning(
          `"${f.name}" حجمه ${(f.size / 1024 / 1024).toFixed(1)} MB — الحد الأقصى ${MAX_FILE_MB} MB، يرجى ضغط الملف أو اختيار ملف أصغر`
        )
      );
      e.target.value = '';
      return;
    }
    setNewFiles(selected);
  };

  if (isLoading || !form) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-xl">
      <ToastContainer position="top-right" rtl autoClose={5000} />
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/documents/general/${id}`}><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">تعديل المستند</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <Input label="نوع الملف" name="file_type" value={form.file_type}
          onChange={handleChange} required />
        <Input label="الوصف" name="description" value={form.description} onChange={handleChange} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            إضافة ملفات جديدة
            <span className="text-gray-400 font-normal text-xs me-1">(تُضاف للملفات الموجودة — حد أقصى {MAX_FILE_MB} MB لكل ملف)</span>
          </label>
          <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFilesChange}
            className="text-sm text-gray-600 file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-white hover:file:bg-gray-50" />
          {newFiles.length > 0 && <p className="text-xs text-gray-500">{newFiles.length} ملف محدد</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ التعديلات</Button>
          <Link href={`/documents/general/${id}`}><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
