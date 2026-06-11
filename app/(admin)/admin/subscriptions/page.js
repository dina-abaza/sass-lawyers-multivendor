'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

const STATUS_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'active', label: 'نشط' },
  { key: 'pending', label: 'معلق' },
  { key: 'cancelled', label: 'ملغى' },
];

function statusLabel(s) {
  if (s === 'active') return { label: 'نشط', cls: 'bg-green-100 text-green-700' };
  if (s === 'cancelled') return { label: 'ملغى', cls: 'bg-red-100 text-red-700' };
  return { label: s || 'معلق', cls: 'bg-yellow-100 text-yellow-700' };
}

export default function AdminSubscriptionsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.getAll().then((r) => r.data),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => subscriptionsApi.activate(id, { payment_method: 'cash' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => subscriptionsApi.cancel(id, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const all = Array.isArray(data) ? data : data?.data ?? [];
  const filtered = activeTab === 'all' ? all : all.filter((s) => s.status === activeTab);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الاشتراكات</h1>
        <p className="text-sm text-gray-500 mt-1">تفعيل وإلغاء اشتراكات المكاتب</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => {
          const cnt = tab.key === 'all' ? all.length : all.filter((s) => s.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ms-1.5 text-xs text-gray-400">({cnt})</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">لا توجد اشتراكات</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المكتب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الباقة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ البدء</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ الانتهاء</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => {
                const { label, cls } = statusLabel(s.status);
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.tenant?.name || `مكتب #${s.tenant_id}`}</td>
                    <td className="px-4 py-3 text-gray-600">{s.plan?.name || s.subscription_id || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.starts_at?.substring(0, 10) || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.ends_at?.substring(0, 10) || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {s.status !== 'active' && (
                          <Button
                            size="sm"
                            onClick={() => activateMutation.mutate(s.id)}
                            loading={activateMutation.isPending}
                          >
                            تفعيل
                          </Button>
                        )}
                        {s.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { if (confirm('إلغاء هذا الاشتراك؟')) cancelMutation.mutate(s.id); }}
                            loading={cancelMutation.isPending}
                          >
                            إلغاء
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
