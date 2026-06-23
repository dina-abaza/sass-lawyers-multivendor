'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { notificationsApi, employeesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function NotificationsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendForm, setSendForm] = useState({ user_ids: [], title: '', message: '' });
  const [sendSuccess, setSendSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: empData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi && showSendForm,
  });

  const employees = Array.isArray(empData) ? empData : empData?.data ?? [];

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(tenantApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAll(tenantApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const sendMutation = useMutation({
    mutationFn: (data) => notificationsApi.send(tenantApi, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setSendForm({ user_ids: [], title: '', message: '' });
      setShowSendForm(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 4000);
    },
  });

  const toggleEmployee = (id) => {
    setSendForm((prev) => ({
      ...prev,
      user_ids: prev.user_ids.includes(id)
        ? prev.user_ids.filter((x) => x !== id)
        : [...prev.user_ids, id],
    }));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!sendForm.title || !sendForm.message || sendForm.user_ids.length === 0) return;
    sendMutation.mutate(sendForm);
  };

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowSendForm((v) => !v)}>
            {showSendForm ? 'إلغاء' : '+ إرسال إشعار'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()}>تحديد الكل كمقروء</Button>
          <Button variant="outline" size="sm" onClick={() => { if (confirm('حذف جميع الإشعارات؟')) deleteAllMutation.mutate(); }}>حذف الكل</Button>
        </div>
      </div>

      {/* رسالة النجاح */}
      {sendSuccess && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <span>✓</span>
          <span>تم إرسال الإشعار بنجاح</span>
        </div>
      )}

      {/* فورم إرسال إشعار */}
      {showSendForm && (
        <form onSubmit={handleSend} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-800">إرسال إشعار للموظفين</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">الموظفون <span className="text-red-500">*</span></label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-36 overflow-y-auto space-y-1">
              {employees.length === 0 ? (
                <p className="text-sm text-gray-400">جاري التحميل...</p>
              ) : employees.map((emp) => (
                <label key={emp.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={sendForm.user_ids.includes(emp.user_id ?? emp.id)}
                    onChange={() => toggleEmployee(emp.user_id ?? emp.id)}
                    className="rounded"
                  />
                  {emp.name}
                </label>
              ))}
            </div>
            {sendForm.user_ids.length > 0 && (
              <p className="text-xs text-blue-600">تم اختيار {sendForm.user_ids.length} موظف</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">العنوان <span className="text-red-500">*</span></label>
            <input
              value={sendForm.title}
              onChange={(e) => setSendForm((p) => ({ ...p, title: e.target.value }))}
              required
              placeholder="عنوان الإشعار"
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">الرسالة <span className="text-red-500">*</span></label>
            <textarea
              value={sendForm.message}
              onChange={(e) => setSendForm((p) => ({ ...p, message: e.target.value }))}
              required
              rows={3}
              placeholder="نص الإشعار..."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <Button type="submit" loading={sendMutation.isPending} disabled={sendForm.user_ids.length === 0}>
            إرسال الإشعار
          </Button>
        </form>
      )}

      {/* قائمة الإشعارات */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد إشعارات</div>
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <div key={n.id} className={`p-4 rounded-xl border flex items-start gap-3 ${n.read_at ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
              {!n.read_at && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{n.title || n.data?.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{n.message || n.data?.message}</p>
                <p className="text-xs text-gray-400 mt-1">{n.created_at?.substring(0, 16)}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!n.read_at && (
                  <button onClick={() => markReadMutation.mutate(n.id)}
                    className="text-xs text-blue-600 hover:underline">
                    قراءة
                  </button>
                )}
                <button onClick={() => { if (confirm('حذف هذا الإشعار؟')) deleteMutation.mutate(n.id); }}
                  className="text-xs text-red-500 hover:text-red-700">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
