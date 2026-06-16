'use client';

import { useQuery } from '@tanstack/react-query';
import { centralApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

function LegalDocIcon() {
  return (
    <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function GeneralDocIcon() {
  return (
    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function FormCard({ doc, type }) {
  const title = doc.title ?? doc.name ?? doc.document_name ?? '—';
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center gap-3 min-h-[150px] cursor-pointer hover:shadow-md hover:border-purple-300 transition-all">
      {type === 'legal' ? <LegalDocIcon /> : <GeneralDocIcon />}
      <p className="text-sm font-medium text-gray-800 text-center leading-snug">{title}</p>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        type === 'legal'
          ? 'bg-purple-50 text-purple-600'
          : 'bg-blue-50 text-blue-600'
      }`}>
        {type === 'legal' ? 'مستند قانوني' : 'مستند عام'}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-gray-500 font-medium">لا توجد نماذج متاحة</p>
      <p className="text-gray-400 text-sm mt-1">ستظهر النماذج هنا عند إضافتها من النظام</p>
    </div>
  );
}

function Section({ title, docs, type, isLoading }) {
  if (isLoading) return null;
  if (docs.length === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-700 border-b border-gray-100 pb-2">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {docs.map((doc) => (
          <FormCard key={doc.id} doc={doc} type={type} />
        ))}
      </div>
    </div>
  );
}

export default function AdminFormsPage() {
  const { data: legalData, isLoading: loadingLegal } = useQuery({
    queryKey: ['admin-legal-documents'],
    queryFn: () => centralApi.get('/legal-documents').then((r) => r.data),
  });

  const { data: generalData, isLoading: loadingGeneral } = useQuery({
    queryKey: ['admin-general-documents'],
    queryFn: () => centralApi.get('/general-documents').then((r) => r.data),
  });

  const isLoading = loadingLegal || loadingGeneral;

  const legalDocs  = Array.isArray(legalData)   ? legalData   : (legalData?.data   ?? []);
  const generalDocs = Array.isArray(generalData) ? generalData : (generalData?.data ?? []);
  const isEmpty = !isLoading && legalDocs.length === 0 && generalDocs.length === 0;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">النماذج</h1>
        <p className="text-gray-500 text-sm mt-1">اختر النموذج المطلوب لملؤه وطباعته</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          <Section
            title="المستندات القانونية"
            docs={legalDocs}
            type="legal"
            isLoading={loadingLegal}
          />
          <Section
            title="المستندات العامة"
            docs={generalDocs}
            type="general"
            isLoading={loadingGeneral}
          />
        </div>
      )}
    </div>
  );
}
