'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { consultationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';

const TYPE_LABEL = { oral: 'شفهية', written: 'مكتوبة' };
const CLASS_LABEL = {
  commercial: 'تجارية', civil: 'مدنية', criminal: 'جنائية', family: 'أسرة',
  labor: 'عمالية', environmental: 'بيئية', investment: 'استثمارية', international: 'دولية',
};

export default function ConsultationDetailPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const respondMutation = useMutation({
    mutationFn: () => consultationsApi.respond(tenantApi, id, { response_text: response }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consultation', id] });
      qc.invalidateQueries({ queryKey: ['consultations'] });
      setResponse('');
    },
    onError: setError,
  });

  const consultation = data?.data ?? data;

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  if (!consultation) return <div className="p-6 text-[#8896A7]">لم يتم العثور على الاستشارة</div>;

  const invoices = consultation.invoices ?? [];

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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الاستشارات</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>تفاصيل الاستشارة</h1>
              {consultation.customer?.name && (
                <p className="text-white/50 text-sm mt-0.5">{consultation.customer.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/consultations"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </Link>
            <Link href={`/consultations/${id}/edit`}
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

      {/* بيانات الاستشارة */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)] space-y-5">
        <h2 className="font-semibold text-[#0A1628] flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          بيانات الاستشارة
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {[
            { label: 'العميل',     value: consultation.customer?.name },
            { label: 'النوع',      value: TYPE_LABEL[consultation.consultation_type] || consultation.consultation_type },
            { label: 'التصنيف',   value: CLASS_LABEL[consultation.general_classification] || consultation.general_classification },
            { label: 'المبلغ',     value: consultation.amount ? `${consultation.amount?.toLocaleString()} ر.س` : null },
          ].filter(({ value }) => value).map(({ label, value }) => (
            <div key={label} className="border-b border-[#F0F2F7] pb-4 last:border-0 last:pb-0">
              <dt className="text-xs text-[#8896A7] mb-1.5 font-medium">{label}</dt>
              <dd className="text-sm font-semibold text-[#0A1628]">{value}</dd>
            </div>
          ))}
        </dl>

        {consultation.subject && (
          <div className="border-t border-[#F0F2F7] pt-4">
            <p className="text-xs text-[#8896A7] mb-1.5 font-medium">الموضوع</p>
            <p className="text-sm text-[#0A1628]">{consultation.subject}</p>
          </div>
        )}
        {consultation.description && (
          <div className="border-t border-[#F0F2F7] pt-4">
            <p className="text-xs text-[#8896A7] mb-1.5 font-medium">الوصف</p>
            <p className="text-sm text-[#0A1628]">{consultation.description}</p>
          </div>
        )}
        {consultation.notes && (
          <div className="border-t border-[#F0F2F7] pt-4">
            <p className="text-xs text-[#8896A7] mb-1.5 font-medium">الملاحظات</p>
            <p className="text-sm text-[#4A5568] whitespace-pre-line">{consultation.notes}</p>
          </div>
        )}

        {consultation.response_text && (
          <div className="border-t border-[#F0F2F7] pt-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-xs font-semibold text-[#D4AF37] mb-2 uppercase tracking-wide">الرد القانوني</p>
              <p className="text-sm text-[#0A1628] whitespace-pre-line">{consultation.response_text}</p>
            </div>
          </div>
        )}
      </div>

      {/* الفواتير */}
      {invoices.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
            الفاتورة
          </h2>
          {invoices.map((inv) => (
            <div key={inv.id} className="space-y-2 text-sm">
              <div className="flex justify-between py-2.5 border-b border-[#F0F2F7]">
                <span className="text-[#8896A7]">المبلغ الأساسي</span>
                <span className="font-semibold text-[#0A1628]">{Number(inv.amount).toLocaleString()} ر.س</span>
              </div>
              {Number(inv.tax_value) > 0 && (
                <div className="flex justify-between py-2.5 border-b border-[#F0F2F7]">
                  <span className="text-[#8896A7]">ضريبة ({inv.tax_rate}%)</span>
                  <span className="font-semibold text-[#0A1628]">{Number(inv.tax_value).toLocaleString()} ر.س</span>
                </div>
              )}
              <div className="flex justify-between py-2.5 font-bold text-[#0A1628]">
                <span>الإجمالي</span>
                <span style={{ color: '#D4AF37' }}>{Number(inv.total_amount).toLocaleString()} ر.س</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* إضافة رد */}
      {!consultation.response_text && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)] space-y-4">
          <h2 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
            إضافة رد
          </h2>
          <ErrorMessage error={error} />
          <textarea rows={4} value={response} onChange={(e) => setResponse(e.target.value)}
            className="w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors resize-none"
            placeholder="اكتب الرد القانوني هنا..." />
          <button
            onClick={() => { setError(null); respondMutation.mutate(); }}
            disabled={respondMutation.isPending || !response.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff', boxShadow: '0 4px 12px rgba(8,26,58,0.25)' }}>
            {respondMutation.isPending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
            إرسال الرد
          </button>
        </div>
      )}
    </div>
  );
}
