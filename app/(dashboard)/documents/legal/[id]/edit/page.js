'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { legalDocsApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Spinner from '@/components/common/Spinner';

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

const DOC_TYPE_OPTIONS = [
  { value: 'general_agency',  label: 'وكالة عامة' },
  { value: 'special_agency',  label: 'وكالة خاصة' },
  { value: 'periodic_agency', label: 'وكالة دورية - عدلية' },
  { value: 'declaration',     label: 'إقرار' },
  { value: 'debt_settlement', label: 'سداد دين' },
  { value: 'legal_pledge',    label: 'تعهد عدلي' },
  { value: 'ownership_deed',  label: 'صك ملكية' },
  { value: 'other',           label: 'أخرى' },
];

export default function EditLegalDocPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['legal-document', id],
    queryFn: () => legalDocsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });

  useEffect(() => {
    const doc = data?.data ?? data;
    if (doc && !form) {
      setForm({
        document_type:   doc.document_type   ?? '',
        agency_number:   doc.agency_number   ?? '',
        document_number: doc.document_number ?? '',
        description:     doc.description     ?? '',
        notes:           doc.notes           ?? '',
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      newFiles.forEach((f) => fd.append('files[]', f));
      return legalDocsApi.update(tenantApi, id, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['legal-documents'] });
      qc.invalidateQueries({ queryKey: ['legal-document', id] });
      router.push(`/documents/legal/${id}`);
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
        <Link href={`/documents/legal/${id}`}><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">تعديل المستند</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <Select label="نوع المستند" name="document_type" value={form.document_type}
          onChange={handleChange} options={DOC_TYPE_OPTIONS} required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="رقم المستند" name="document_number" value={form.document_number}
            onChange={handleChange} required />
          <Input label="رقم الوكالة" name="agency_number" value={form.agency_number}
            onChange={handleChange} placeholder="اختياري" />
        </div>

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
          <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFilesChange}
            className="text-sm text-gray-600 file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-white hover:file:bg-gray-50" />
          {newFiles.length > 0 && <p className="text-xs text-gray-500">{newFiles.length} ملف محدد</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ التعديلات</Button>
          <Link href={`/documents/legal/${id}`}><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
