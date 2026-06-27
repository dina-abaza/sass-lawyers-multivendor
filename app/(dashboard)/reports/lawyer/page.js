'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { casesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function LawyerReportPage() {
  const { tenantApi } = useAuth();
  const [selectedId, setSelectedId] = useState('');
  const [queryId, setQueryId] = useState(null);

  const { data: lawyersData, isLoading: lawyersLoading } = useQuery({
    queryKey: ['lawyers'],
    queryFn: () => casesApi.getLawyers(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });
  const lawyers = Array.isArray(lawyersData) ? lawyersData : lawyersData?.data ?? [];

  const { data: raw, isLoading: reportLoading } = useQuery({
    queryKey: ['lawyer-report', queryId],
    queryFn: () => casesApi.getLawyer(tenantApi, queryId).then((r) => r.data),
    enabled: !!tenantApi && !!queryId,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId) return;
    setQueryId(selectedId);
  };

  const lawyer = raw?.data ?? {};
  const cases = lawyer.cases ?? [];

  const formatDate = (iso) => iso ? iso.split('T')[0] : '—';

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">تقرير المحامي</h1>

      {/* فورم الاختيار */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-48 flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">اختر المحامي <span className="text-red-500">*</span></label>
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setQueryId(null); }}
            required
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— اختر محامياً —</option>
            {lawyersLoading ? (
              <option disabled>جاري التحميل...</option>
            ) : lawyers.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <Button type="submit">عرض التقرير</Button>
      </form>

      {/* التقرير */}
      {queryId && (
        reportLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
        ) : !lawyer.id ? (
          <div className="text-center py-12 text-gray-400">لا توجد بيانات لهذا المحامي</div>
        ) : (
          <div className="space-y-5">
            {/* بيانات المحامي */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
                {lawyer.profile_image ? (
                  <img src={lawyer.profile_image} alt="صورة المحامي" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-blue-700 font-bold text-xl">{(lawyer.name || '؟')[0]}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{lawyer.name}</p>
                <p className="text-sm text-gray-500">{lawyer.email}</p>
              </div>
            </div>

            {/* بطاقة إحصائية */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-700">{cases.length}</p>
                <p className="text-sm text-blue-600 mt-1 font-medium">إجمالي القضايا</p>
              </div>
              <div className="h-12 w-px bg-blue-200 mx-2" />
              <div className="text-sm text-blue-700 space-y-1">
                <p>إجمالي قيمة القضايا: <span className="font-bold">{cases.reduce((s, c) => s + Number(c.value || 0), 0).toLocaleString()} ر.س</span></p>
                <p>آخر قضية: <span className="font-bold">{cases.length > 0 ? formatDate(cases[cases.length - 1].date) : '—'}</span></p>
              </div>
            </div>

            {/* جدول القضايا */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">القضايا ({cases.length})</h2>
              </div>
              {cases.length === 0 ? (
                <div className="py-10 text-center text-gray-400">لا توجد قضايا مسجلة لهذا المحامي</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">رقم القضية</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">الموضوع</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">الجهة</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">المكتب</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">الخصم</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">القيمة</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cases.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{c.case_number || '—'}</td>
                        <td className="px-4 py-3 text-gray-900">{c.subject || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{c.agency || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{c.office || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{c.opponent_name || '—'}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{Number(c.value || 0).toLocaleString()} ر.س</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(c.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
