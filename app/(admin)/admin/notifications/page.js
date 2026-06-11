'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function AdminNotificationsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', message: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => notificationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const sendMutation = useMutation({
    mutationFn: (d) => notificationsApi.send(tenantApi, d),
    onSuccess: () => {
      setSuccess('تم إرسال الإشعار بنجاح');
      setForm({ title: '', message: '' });
      setError('');
      qc.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'حدث خطأ أثناء الإرسال');
      setSuccess('');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAll(tenantApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(tenantApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
        <p className="text-sm text-gray-500 mt-1">إرسال إشعارات للمستخدمين وإدارة الإشعارات الحالية</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">إرسال إشعار جديد</h2>
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="عنوان الإشعار"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="محتوى الإشعار"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => sendMutation.mutate(form)}
              loading={sendMutation.isPending}
              disabled={!form.title || !form.message}
            >
              إرسال الإشعار
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">الإشعارات السابقة</h2>
          {list.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => markAllMutation.mutate()}
                className="text-xs text-blue-600 hover:underline"
              >
                تحديد الكل كمقروء
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => { if (confirm('حذف كل الإشعارات؟')) deleteAllMutation.mutate(); }}
                className="text-xs text-red-600 hover:underline"
              >
                حذف الكل
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد إشعارات</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {list.map((n) => (
              <div key={n.id} className={`px-6 py-4 flex items-start gap-3 ${!n.read_at ? 'bg-blue-50/30' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read_at ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.data?.title || n.title || 'إشعار'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.data?.message || n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.created_at?.substring(0, 16)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
