'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { generalDocsApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/common/ErrorMessage';
import Spinner from '@/components/common/Spinner';

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

const labelCls = 'block text-xs font-semibold text-[#4A5568] mb-1.5';
const fieldCls = 'w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors resize-none';

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

  if (isLoading || !form) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-xl mx-auto">
      <ToastContainer position="top-right" rtl autoClose={5000} />

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المستندات العامة</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>تعديل المستند</h1>
            </div>
          </div>
          <Link href={`/documents/general/${id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            رجوع
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <div className="w-full h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #D4AF37, #B8961F)' }} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }} className="space-y-5">
          <ErrorMessage error={error} />

          <Input label="نوع الملف" name="file_type" value={form.file_type}
            onChange={handleChange} required />
          <Input label="الوصف" name="description" value={form.description} onChange={handleChange} />

          <div>
            <label className={labelCls}>ملاحظات</label>
            <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} className={fieldCls} />
          </div>

          <div className="rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] p-4">
            <label className={labelCls}>
              إضافة ملفات جديدة
              <span className="text-[#8896A7] font-normal text-xs me-1">(تُضاف للملفات الموجودة — حد أقصى {MAX_FILE_MB} MB لكل ملف)</span>
            </label>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFilesChange}
              className="w-full text-sm text-[#4A5568] file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#E2E6F0] file:text-sm file:font-medium file:bg-white file:text-[#081A3A] hover:file:bg-[#EBF0FA] transition-colors" />
            {newFiles.length > 0 && (
              <p className="text-xs text-[#D4AF37] font-semibold mt-2">{newFiles.length} ملف محدد</p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
              {mutation.isPending
                ? <span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              حفظ التعديلات
            </button>
            <Link href={`/documents/general/${id}`}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
