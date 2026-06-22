'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { consultationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
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

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (!consultation) return <div className="p-6 text-gray-500">لم يتم العثور على الاستشارة</div>;

  const invoices = consultation.invoices ?? [];

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/consultations"><Button variant="ghost" size="sm">→</Button></Link>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل الاستشارة</h1>
        </div>
        <Link href={`/consultations/${id}/edit`}>
          <Button variant="outline" size="sm">تعديل</Button>
        </Link>
      </div>

      {/* Consultation Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium text-gray-600">العميل: </span><span className="text-gray-900">{consultation.customer?.name}</span></div>
          <div><span className="font-medium text-gray-600">النوع: </span><span className="text-gray-900">{TYPE_LABEL[consultation.consultation_type] || consultation.consultation_type}</span></div>
          <div><span className="font-medium text-gray-600">التصنيف: </span><span className="text-gray-900">{CLASS_LABEL[consultation.general_classification] || consultation.general_classification}</span></div>
          <div><span className="font-medium text-gray-600">المبلغ: </span><span className="text-gray-900">{consultation.amount?.toLocaleString()} ر.س</span></div>
        </div>

        {consultation.subject && (
          <div>
            <span className="font-medium text-gray-600 text-sm">الموضوع: </span>
            <p className="text-gray-900 mt-1">{consultation.subject}</p>
          </div>
        )}
        {consultation.description && (
          <div>
            <span className="font-medium text-gray-600 text-sm">الوصف: </span>
            <p className="text-gray-900 mt-1">{consultation.description}</p>
          </div>
        )}
        {consultation.notes && (
          <div>
            <span className="font-medium text-gray-600 text-sm">الملاحظات: </span>
            <p className="text-gray-700 mt-1 whitespace-pre-line">{consultation.notes}</p>
          </div>
        )}
        {consultation.response_text && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <span className="font-medium text-green-700 text-sm">الرد القانوني: </span>
            <p className="text-green-900 mt-1 whitespace-pre-line">{consultation.response_text}</p>
          </div>
        )}
      </div>

      {/* Invoice Section */}
      {invoices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">الفاتورة</h2>
          {invoices.map((inv) => (
            <div key={inv.id} className="text-sm space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">المبلغ الأساسي</span>
                <span className="font-medium">{Number(inv.amount).toLocaleString()} ر.س</span>
              </div>
              {Number(inv.tax_value) > 0 && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">ضريبة ({inv.tax_rate}%)</span>
                  <span className="font-medium">{Number(inv.tax_value).toLocaleString()} ر.س</span>
                </div>
              )}
              <div className="flex justify-between py-1 font-semibold text-gray-900">
                <span>الإجمالي</span>
                <span>{Number(inv.total_amount).toLocaleString()} ر.س</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Form */}
      {!consultation.response_text && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">إضافة رد</h2>
          <ErrorMessage error={error} />
          <textarea
            rows={4}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="اكتب الرد القانوني هنا..."
          />
          <Button
            onClick={() => { setError(null); respondMutation.mutate(); }}
            loading={respondMutation.isPending}
            disabled={!response.trim()}
          >
            إرسال الرد
          </Button>
        </div>
      )}
    </div>
  );
}
