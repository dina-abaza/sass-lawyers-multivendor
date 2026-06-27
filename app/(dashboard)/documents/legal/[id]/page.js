'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { legalDocsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const DOC_TYPES = {
  general_agency:  'وكالة عامة',
  special_agency:  'وكالة خاصة',
  periodic_agency: 'وكالة دورية - عدلية',
  declaration:     'إقرار',
  debt_settlement: 'سداد دين',
  legal_pledge:    'تعهد عدلي',
  ownership_deed:  'صك ملكية',
  other:           'أخرى',
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LegalDocDetailPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['legal-document', id],
    queryFn: () => legalDocsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });

  const deleteFileMutation = useMutation({
    mutationFn: (index) => legalDocsApi.deleteFile(tenantApi, id, index),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['legal-document', id] }),
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;

  const doc = data?.data ?? data;
  if (!doc) return <div className="p-6 text-[#8896A7]">المستند غير موجود</div>;

  const files = Array.isArray(doc.files) ? doc.files : [];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">

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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المستندات القانونية</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>تفاصيل المستند</h1>
              <p className="text-white/50 text-sm mt-0.5">{DOC_TYPES[doc.document_type] || doc.document_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/documents/legal"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </Link>
            <Link href={`/documents/legal/${id}/edit`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              تعديل
            </Link>
          </div>
        </div>
      </div>

      {/* بيانات المستند */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-5 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          بيانات المستند
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {[
            { label: 'العميل',       value: doc.customer?.name },
            { label: 'نوع المستند',  value: DOC_TYPES[doc.document_type] || doc.document_type },
            { label: 'رقم المستند',  value: doc.document_number },
            { label: 'رقم الوكالة', value: doc.agency_number },
            { label: 'الوصف',        value: doc.description },
            { label: 'ملاحظات',     value: doc.notes },
          ].filter(({ value }) => value).map(({ label, value }) => (
            <div key={label} className="border-b border-[#F0F2F7] pb-4 last:border-0 last:pb-0">
              <dt className="text-xs text-[#8896A7] mb-1.5 font-medium">{label}</dt>
              <dd className="text-sm font-semibold text-[#0A1628]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* الملفات */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          الملفات المرفقة
          <span className="text-xs text-[#8896A7] font-normal">({files.length})</span>
        </h2>
        {files.length === 0 ? (
          <p className="text-[#8896A7] text-sm">لا توجد ملفات مرفقة</p>
        ) : (
          <ul className="divide-y divide-[#F0F2F7]">
            {files.map((file, index) => (
              <li key={index} className="flex items-center gap-3 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF0FA] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#081A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0A1628] truncate">{file.name || `ملف ${index + 1}`}</p>
                  {file.size && <p className="text-xs text-[#8896A7] mt-0.5">{formatSize(file.size)}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {file.path && (
                    <a href={file.path} target="_blank" rel="noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#EBF0FA] text-[#081A3A] hover:bg-[#081A3A]/15 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  )}
                  <button onClick={() => { if (confirm('حذف هذا الملف؟')) deleteFileMutation.mutate(index); }}
                    disabled={deleteFileMutation.isPending}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
