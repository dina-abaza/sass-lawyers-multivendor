'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { sessionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const SESSION_TYPES = {
  initial: 'ابتدائية',
  appeal: 'استئنافية',
  cassation: 'نقض',
  execution: 'تنفيذية',
};

const SESSION_RESULTS = {
  pending: 'معلقة',
  adjourned: 'مؤجلة',
  decided: 'محكوم بها',
  cancelled: 'ملغاة',
};

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

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل الجلسة</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="px-6 py-4 flex justify-between">
          <span className="text-sm text-gray-500">رقم الجلسة</span>
          <span className="text-sm font-medium text-gray-900">#{session.id}</span>
        </div>
        {session.case && (
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">القضية</span>
            <Link href={`/cases/${session.case_id}`} className="text-sm font-medium text-blue-600 hover:underline">
              {session.case?.name || session.case?.title || `#${session.case_id}`}
            </Link>
          </div>
        )}
        {session.date && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">التاريخ</span>
            <span className="text-sm font-medium text-gray-900">{session.date}</span>
          </div>
        )}
        {session.time && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">الوقت</span>
            <span className="text-sm font-medium text-gray-900 dir-ltr">{session.time}</span>
          </div>
        )}
        {session.type && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">النوع</span>
            <span className="text-sm font-medium text-gray-900">{SESSION_TYPES[session.type] || session.type}</span>
          </div>
        )}
        {session.court && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">المحكمة</span>
            <span className="text-sm font-medium text-gray-900">{session.court}</span>
          </div>
        )}
        {session.judge && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">القاضي</span>
            <span className="text-sm font-medium text-gray-900">{session.judge}</span>
          </div>
        )}
        {session.result && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">النتيجة</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              session.result === 'decided' ? 'bg-green-100 text-green-700' :
              session.result === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              session.result === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>{SESSION_RESULTS[session.result] || session.result}</span>
          </div>
        )}
        {session.notes && (
          <div className="px-6 py-4">
            <span className="text-sm text-gray-500 block mb-1">ملاحظات</span>
            <p className="text-sm text-gray-800">{session.notes}</p>
          </div>
        )}
        {session.next_date && (
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-gray-500">الجلسة القادمة</span>
            <span className="text-sm font-medium text-gray-900">{session.next_date}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <Link href="/sessions/create"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          جلسة جديدة
        </Link>
        <Link href="/sessions" className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
          قائمة الجلسات
        </Link>
      </div>
    </div>
  );
}
