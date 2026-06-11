'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { consultationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function ConsultationDetailPage() {
  const { id } = useParams();
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationsApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const respondMutation = useMutation({
    mutationFn: () => consultationsApi.respond(tenantApi, id, { response_text: response }),
    onSuccess: () => router.push('/consultations'),
    onError: setError,
  });

  const consultation = data?.data ?? data;

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!consultation) return <div className="p-6 text-gray-500">لم يتم العثور على الاستشارة</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/consultations"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل الاستشارة</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-gray-600">العميل: </span><span>{consultation.customer?.name}</span></div>
          <div><span className="font-medium text-gray-600">النوع: </span><span>{consultation.consultation_type}</span></div>
          <div><span className="font-medium text-gray-600">التصنيف: </span><span>{consultation.general_classification}</span></div>
          <div><span className="font-medium text-gray-600">المبلغ: </span><span>{consultation.amount?.toLocaleString()} ر.س</span></div>
        </div>
        <div><span className="font-medium text-gray-600 text-sm">الموضوع: </span><p className="text-gray-900 mt-1">{consultation.subject}</p></div>
        {consultation.description && (
          <div><span className="font-medium text-gray-600 text-sm">الوصف: </span><p className="text-gray-900 mt-1">{consultation.description}</p></div>
        )}
        {consultation.response_text && (
          <div className="p-4 bg-green-50 rounded-lg">
            <span className="font-medium text-green-700 text-sm">الرد: </span>
            <p className="text-green-900 mt-1">{consultation.response_text}</p>
          </div>
        )}
      </div>

      {!consultation.response_text && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">إضافة رد</h2>
          <ErrorMessage error={error} />
          <textarea rows={4} value={response} onChange={(e) => setResponse(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="اكتب الرد القانوني هنا..." />
          <Button onClick={() => respondMutation.mutate()} loading={respondMutation.isPending}>إرسال الرد</Button>
        </div>
      )}
    </div>
  );
}
