'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

const TABS = [
  { key: '',          label: 'الكل'    },
  { key: 'canceled',  label: 'منتهية'  },
  { key: 'active',    label: 'نشطة'    },
  { key: 'pending',   label: 'معلقة'   },
  { key: 'cancelled', label: 'ملغاة'   },
];

function badge(status) {
  if (status === 'active')
    return { label: 'نشط',  cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' };
  if (status === 'canceled' || status === 'cancelled')
    return { label: 'ملغى',  cls: 'bg-red-50 text-red-700 border border-red-100'           };
  if (status === 'pending')
    return { label: 'معلق', cls: 'bg-[#FDF8E7] text-[#B8961F] border border-[#D4AF37]/20' };
  return { label: status || '—', cls: 'bg-[#F8F9FC] text-[#8896A7] border border-[#E2E6F0]' };
}

const inputCls = 'border border-[#E2E6F0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] bg-white transition-colors';

export default function SubscriptionsManagementPage() {
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const [activeTab,   setActiveTab]   = useState(searchParams.get('status') ?? '');
  const [expandedRow, setExpandedRow] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelNote,  setCancelNote]  = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tenant-subs-mgmt', activeTab],
    queryFn: () => subscriptionsApi.getByStatus(activeTab).then((r) => r.data),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => subscriptionsApi.activate(id, { payment_method: 'cash', notes: 'تفعيل يدوي' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenant-subs-mgmt'] }),
  });

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
      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-1">لوحة المدير</p>
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>إدارة اشتراكات المكاتب</h1>
          <p className="text-white/50 text-sm mt-1">تفعيل وإلغاء اشتراكات المكاتب</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-[#F8F9FC] rounded-xl p-1 w-fit flex-wrap border border-[#E2E6F0]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setExpandedRow(null); setCancelingId(null); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-white shadow-sm text-[#0A1628] border border-[#E2E6F0]'
                : 'text-[#8896A7] hover:text-[#4A5568]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E6F0] overflow-hidden shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F9FC] border-b border-[#E2E6F0]">
                <tr>
                  {['المكتب/المشترك', 'الباقة', 'المبلغ المدفوع', 'الحالة', 'تاريخ الانتهاء', 'تفاصيل الإلغاء', 'الإجراءات'].map((h) => (
                    <th key={h} className="px-4 py-3 text-right font-semibold text-[#4A5568] text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-[#8896A7]">لا توجد اشتراكات</td>
                  </tr>
                ) : (
                  list.map((s) => {
                    const { label, cls } = badge(s.status);
                    const isCanceled    = s.status === 'canceled' || s.status === 'cancelled';
                    const isExpanded    = expandedRow === s.id;
                    const isCanceling   = cancelingId === s.id;

                    return (
                      <React.Fragment key={s.id}>
                        <tr className="border-b border-[#F0F2F7] hover:bg-[#F8F9FC] transition-colors">
                          <td className="px-4 py-3.5 font-semibold text-[#0A1628]">{s.tenant_id || '—'}</td>
                          <td className="px-4 py-3.5 text-[#4A5568]">{s.plan?.name || '—'}</td>
                          <td className="px-4 py-3.5 text-[#4A5568] font-medium">{s.amount_paid} ر.س</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
                          </td>
                          <td className="px-4 py-3.5 text-[#8896A7] text-xs">{s.expires_at?.substring(0, 10) || '—'}</td>
                          <td className="px-4 py-3.5">
                            {isCanceled && s.notes ? (
                              <button
                                onClick={() => setExpandedRow(isExpanded ? null : s.id)}
                                className="text-xs text-[#D4AF37] hover:text-[#B8961F] font-medium transition-colors">
                                {isExpanded ? 'إخفاء' : 'عرض التفاصيل'}
                              </button>
                            ) : (
                              <span className="text-[#8896A7] text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {s.status !== 'active' && (
                                <Button size="sm"
                                  onClick={() => activateMutation.mutate(s.id)}
                                  loading={activateMutation.isPending && activateMutation.variables === s.id}>
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

                        {isExpanded && (
                          <tr className="bg-[#F8F9FC] border-b border-[#F0F2F7]">
                            <td colSpan={7} className="px-6 py-3 text-xs text-[#4A5568]">
                              <pre className="whitespace-pre-wrap font-sans">{s.notes}</pre>
                            </td>
                          </tr>
                        )}

                        {isCanceling && (
                          <tr className="bg-red-50/60 border-b border-[#F0F2F7]">
                            <td colSpan={7} className="px-6 py-4">
                              <p className="text-sm font-semibold text-red-700 mb-2">سبب الإلغاء (مطلوب)</p>
                              <div className="flex items-center gap-3">
                                <input
                                  type="text" value={cancelNote}
                                  onChange={(e) => setCancelNote(e.target.value)}
                                  placeholder="اكتب سبب الإلغاء..."
                                  className="flex-1 border border-red-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                                />
                                <Button size="sm" variant="danger"
                                  onClick={() => cancelMutation.mutate({ id: s.id, notes: cancelNote })}
                                  disabled={!cancelNote.trim()}
                                  loading={cancelMutation.isPending}>
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
          <div className="px-4 py-3 border-t border-[#F0F2F7] text-xs text-[#8896A7]">
            عرض 1–{list.length} من {total} سجل
          </div>
        )}
      </div>
    </div>
  );
}
