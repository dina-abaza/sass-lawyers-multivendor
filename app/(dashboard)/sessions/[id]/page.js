'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { sessionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

export default function SessionDetailPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi && !!id,
  });

  const session = data?.data ?? data;

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  if (isError || !session) return (
    <div className="p-6 text-center text-[#8896A7]">
      <p>تعذر تحميل بيانات الجلسة</p>
      <button onClick={() => router.back()} className="mt-3 text-[#D4AF37] hover:underline text-sm">رجوع</button>
    </div>
  );

  const files = Array.isArray(session.files) ? session.files : [];

  const rows = [
    { label: 'رقم الجلسة',       value: session.session_number },
    { label: 'القضية',            value: session.legal_case?.case_number },
    { label: 'المحامي',           value: session.lawyer?.name },
    { label: 'الحالة',            value: session.status?.name },
    { label: 'الجهة القضائية',   value: session.court_side },
    { label: 'الجهة',             value: session.agency },
    { label: 'اليوم',             value: session.day },
    { label: 'التاريخ الميلادي', value: session.date },
    { label: 'التاريخ الهجري',   value: session.date_hijri },
    { label: 'وقت الجلسة',       value: session.session_time },
    { label: 'تاريخ التذكير',    value: session.reminder_date },
  ].filter(({ value }) => value);

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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الجلسات</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>تفاصيل الجلسة</h1>
              {session.session_number && (
                <p className="text-white/50 text-sm mt-0.5">رقم {session.session_number}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </button>
            <Link href={`/sessions/${id}/edit`}
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

      {/* بيانات الجلسة */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          بيانات الجلسة
        </h2>
        <dl className="divide-y divide-[#F0F2F7]">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3.5">
              <dt className="text-sm text-[#8896A7]">{label}</dt>
              <dd className="text-sm font-semibold text-[#0A1628]">{value}</dd>
            </div>
          ))}
        </dl>
        {session.notes && (
          <div className="mt-4 pt-4 border-t border-[#F0F2F7]">
            <p className="text-xs text-[#8896A7] mb-1.5 font-medium">ملاحظات</p>
            <p className="text-sm text-[#4A5568] whitespace-pre-line">{session.notes}</p>
          </div>
        )}
      </div>

      {/* المرفقات */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
            المرفقات
            <span className="text-xs text-[#8896A7] font-normal">({files.length})</span>
          </h2>
          <ul className="divide-y divide-[#F0F2F7]">
            {files.map((url, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#EBF0FA] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#081A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href={url} target="_blank" rel="noreferrer"
                  className="text-sm font-semibold text-[#081A3A] hover:text-[#D4AF37] transition-colors">
                  مرفق {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* أزرار الإجراءات */}
      <div className="flex gap-3">
        <Link href="/sessions/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          جلسة جديدة
        </Link>
        <Link href="/sessions"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
          قائمة الجلسات
        </Link>
      </div>
    </div>
  );
}
