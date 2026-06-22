'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { sessionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="px-6 py-4 flex justify-between items-start border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-left">{value}</span>
    </div>
  );
}

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

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (isError || !session) return (
    <div className="p-6 text-center text-gray-500">
      <p>تعذر تحميل بيانات الجلسة</p>
      <button onClick={() => router.back()} className="mt-3 text-blue-600 hover:underline text-sm">رجوع</button>
    </div>
  );

  const files = Array.isArray(session.files) ? session.files : [];

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل الجلسة</h1>
        </div>
        <Link href={`/sessions/${id}/edit`}>
          <Button variant="outline" size="sm">تعديل</Button>
        </Link>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <Row label="رقم الجلسة" value={session.session_number} />
        <Row label="القضية" value={session.legal_case?.case_number} />
        <Row label="المحامي" value={session.lawyer?.name} />
        <Row label="الحالة" value={session.status?.name} />
        <Row label="الجهة القضائية" value={session.court_side} />
        <Row label="الجهة" value={session.agency} />
        <Row label="اليوم" value={session.day} />
        <Row label="التاريخ الميلادي" value={session.date} />
        <Row label="التاريخ الهجري" value={session.date_hijri} />
        <Row label="وقت الجلسة" value={session.session_time} />
        <Row label="تاريخ التذكير" value={session.reminder_date} />
        {session.notes && (
          <div className="px-6 py-4">
            <span className="text-sm text-gray-500 block mb-1">ملاحظات</span>
            <p className="text-sm text-gray-800 whitespace-pre-line">{session.notes}</p>
          </div>
        )}
      </div>

      {/* Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">المرفقات</h2>
          <ul className="space-y-2">
            {files.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noreferrer"
                  className="text-blue-600 hover:underline text-sm">
                  مرفق {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/sessions/create">
          <Button>+ جلسة جديدة</Button>
        </Link>
        <Link href="/sessions">
          <Button variant="outline">قائمة الجلسات</Button>
        </Link>
      </div>
    </div>
  );
}
