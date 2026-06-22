'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { legalDocsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

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

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
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

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  const doc = data?.data ?? data;
  if (!doc) return <div className="p-6 text-gray-500">المستند غير موجود</div>;

  const files = Array.isArray(doc.files) ? doc.files : [];

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/documents/legal"><Button variant="ghost" size="sm">→</Button></Link>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل المستند</h1>
        </div>
        <Link href={`/documents/legal/${id}/edit`}><Button>تعديل</Button></Link>
      </div>

      {/* معلومات المستند */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">بيانات المستند</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="العميل" value={doc.customer?.name} />
          <Field label="نوع المستند" value={DOC_TYPES[doc.document_type] || doc.document_type} />
          <Field label="رقم المستند" value={doc.document_number} />
          <Field label="رقم الوكالة" value={doc.agency_number} />
          <Field label="الوصف" value={doc.description} />
          <Field label="ملاحظات" value={doc.notes} />
        </dl>
      </div>

      {/* الملفات */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">الملفات المرفقة ({files.length})</h2>
        {files.length === 0 ? (
          <p className="text-gray-400 text-sm">لا توجد ملفات مرفقة</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {files.map((file, index) => (
              <li key={index} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name || `ملف ${index + 1}`}</p>
                  {file.size && <p className="text-xs text-gray-400">{formatSize(file.size)}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {file.path && (
                    <a href={file.path} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline">تحميل</a>
                  )}
                  <button
                    onClick={() => { if (confirm('حذف هذا الملف؟')) deleteFileMutation.mutate(index); }}
                    disabled={deleteFileMutation.isPending}
                    className="text-xs text-red-500 hover:text-red-700">
                    حذف
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
