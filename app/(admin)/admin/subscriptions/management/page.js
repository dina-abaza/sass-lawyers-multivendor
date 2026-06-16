'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

const TABS = [
  { key: '',         label: 'الكل'     },
  { key: 'canceled', label: 'منتهية'   },
  { key: 'active',   label: 'نشطة'     },
  { key: 'pending',  label: 'البلغة'   },
  { key: 'cancelled',label: 'الملغاة'  },
];

function badge(status) {
  if (status === 'active')                        return { label: 'نشط',  cls: 'bg-green-100  text-green-700'  };
  if (status === 'canceled' || status === 'cancelled') return { label: 'ملغى',  cls: 'bg-red-100    text-red-700'    };
  if (status === 'pending')                       return { label: 'معلق', cls: 'bg-yellow-100 text-yellow-700' };
  return { label: status || '—', cls: 'bg-gray-100 text-gray-600' };
}

export default function SubscriptionsManagementPage() {
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const [activeTab,   setActiveTab]   = useState(searchParams.get('status') ?? '');
  const [expandedRow, setExpandedRow] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelNote,  setCancelNote]  = useState('');

  // GET /api/subscriptions/status?status={key}
  const { data, isLoading } = useQuery({
    queryKey: ['tenant-subs-mgmt', activeTab],
    queryFn: () => subscriptionsApi.getByStatus(activeTab).then((r) => r.data),
  });

  // POST /api/subscriptions/{id}/activate
  const activateMutation = useMutation({
    mutationFn: (id) => subscriptionsApi.activate(id, { payment_method: 'cash', notes: 'تفعيل يدوي' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-subs-mgmt'] }),
  });

  // POST /api/subscriptions/{id}/cancel
  const cancelMutation = useMutation({
    mutationFn: ({ id, notes }) => subscriptionsApi.cancel(id, { notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-subs-mgmt'] });
      setCancelingId(null);
      setCancelNote('');
    },
  });

  const list  = data?.data  ?? [];
  const total = data?.count ?? list.length;

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">إدارة اشتراكات المكاتب</h1>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setExpandedRow(null); setCancelingId(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">المكتب/المشترك</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الباقة المشترك</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">المبلغ المدفوع</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ الانتهاء</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">تفاصيل الإلغاء</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">لا توجد اشتراكات</td>
                  </tr>
                ) : (
                  list.map((s) => {
                    const { label, cls } = badge(s.status);
                    const isCanceled    = s.status === 'canceled' || s.status === 'cancelled';
                    const isExpanded    = expandedRow === s.id;
                    const isCanceling   = cancelingId === s.id;

                    return (
                      <React.Fragment key={s.id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{s.tenant_id || '—'}</td>
                          <td className="px-4 py-3 text-gray-700">{s.plan?.name || '—'}</td>
                          <td className="px-4 py-3 text-gray-700">{s.amount_paid} رس</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{s.expires_at?.substring(0, 10) || '—'}</td>
                          <td className="px-4 py-3">
                            {isCanceled && s.notes ? (
                              <button
                                onClick={() => setExpandedRow(isExpanded ? null : s.id)}
                                className="text-xs text-purple-600 hover:underline"
                              >
                                {isExpanded ? 'إخفاء' : 'عرض التفاصيل'}
                              </button>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {s.status !== 'active' && (
                                <Button
                                  size="sm"
                                  onClick={() => activateMutation.mutate(s.id)}
                                  loading={activateMutation.isPending && activateMutation.variables === s.id}
                                >
                                  تفعيل
                                </Button>
                              )}
                              {s.status === 'active' && (
                                <Button size="sm" variant="danger" onClick={() => setCancelingId(s.id)}>
                                  إلغاء
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Notes row */}
                        {isExpanded && (
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <td colSpan={7} className="px-6 py-3 text-xs text-gray-600">
                              <pre className="whitespace-pre-wrap font-sans">{s.notes}</pre>
                            </td>
                          </tr>
                        )}

                        {/* Cancel form row */}
                        {isCanceling && (
                          <tr className="bg-red-50 border-b border-gray-100">
                            <td colSpan={7} className="px-6 py-4">
                              <p className="text-sm font-medium text-red-700 mb-2">سبب الإلغاء (مطلوب)</p>
                              <div className="flex items-center gap-3">
                                <input
                                  type="text" value={cancelNote}
                                  onChange={(e) => setCancelNote(e.target.value)}
                                  placeholder="اكتب سبب الإلغاء..."
                                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                                <Button
                                  size="sm" variant="danger"
                                  onClick={() => cancelMutation.mutate({ id: s.id, notes: cancelNote })}
                                  disabled={!cancelNote.trim()}
                                  loading={cancelMutation.isPending}
                                >
                                  تأكيد الإلغاء
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setCancelingId(null)}>
                                  تراجع
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && list.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            عرض 1 - {list.length} من {total} سجل
          </div>
        )}
      </div>
    </div>
  );
}
