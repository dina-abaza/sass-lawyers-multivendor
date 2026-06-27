'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { notificationsApi, employeesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const fieldCls = 'w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors resize-none';
const inputCls = 'h-10 w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors';
const labelCls = 'block text-xs font-semibold text-[#4A5568] mb-1.5';

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
    <div className="p-4 sm:p-8 space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">النظام</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>الإشعارات</h1>
              {list.length > 0 && (
                <p className="text-white/50 text-sm mt-0.5">{list.filter((n) => !n.read_at).length} غير مقروء</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowSendForm((v) => !v)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: showSendForm ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #D4AF37, #B8961F)', color: showSendForm ? '#ffffff' : '#081A3A' }}>
              {showSendForm ? 'إلغاء' : '+ إرسال إشعار'}
            </button>
            <button onClick={() => markAllMutation.mutate()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
              قراءة الكل
            </button>
            <button onClick={() => { if (confirm('حذف جميع الإشعارات؟')) deleteAllMutation.mutate(); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.25)' }}>
              حذف الكل
            </button>
          </div>
        </div>
      </div>

      {/* رسالة النجاح */}
      {sendSuccess && (
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold"
          style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: '#065F46' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          تم إرسال الإشعار بنجاح
        </div>
      )}

      {/* فورم إرسال إشعار */}
      {showSendForm && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="w-full h-1 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #D4AF37, #B8961F)' }} />
          <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
            إرسال إشعار للموظفين
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className={labelCls}>الموظفون <span className="text-red-500">*</span></label>
              <div className="border border-[#E2E6F0] rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5 bg-[#F8F9FC]">
                {employees.length === 0 ? (
                  <p className="text-sm text-[#8896A7]">جاري التحميل...</p>
                ) : employees.map((emp) => (
                  <label key={emp.id} className="flex items-center gap-2.5 cursor-pointer text-sm text-[#0A1628]">
                    <input
                      type="checkbox"
                      checked={sendForm.user_ids.includes(emp.user_id ?? emp.id)}
                      onChange={() => toggleEmployee(emp.user_id ?? emp.id)}
                      className="w-4 h-4 rounded accent-[#D4AF37]"
                    />
                    {emp.name}
                  </label>
                ))}
              </div>
              {sendForm.user_ids.length > 0 && (
                <p className="text-xs font-semibold mt-1.5" style={{ color: '#D4AF37' }}>
                  تم اختيار {sendForm.user_ids.length} موظف
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>العنوان <span className="text-red-500">*</span></label>
              <input
                value={sendForm.title}
                onChange={(e) => setSendForm((p) => ({ ...p, title: e.target.value }))}
                required
                placeholder="عنوان الإشعار"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>الرسالة <span className="text-red-500">*</span></label>
              <textarea
                value={sendForm.message}
                onChange={(e) => setSendForm((p) => ({ ...p, message: e.target.value }))}
                required
                rows={3}
                placeholder="نص الإشعار..."
                className={fieldCls}
              />
            </div>

            <button type="submit" disabled={sendMutation.isPending || sendForm.user_ids.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
              {sendMutation.isPending
                ? <span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>}
              إرسال الإشعار
            </button>
          </form>
        </div>
      )}

      {/* قائمة الإشعارات */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <p className="text-[#8896A7] text-sm">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((n) => (
            <div key={n.id}
              className="p-4 rounded-2xl border flex items-start gap-3 transition-colors"
              style={!n.read_at
                ? { background: 'rgba(8,26,58,0.03)', border: '1px solid rgba(8,26,58,0.12)' }
                : { background: '#ffffff', border: '1px solid #E2E6F0' }}>
              {!n.read_at && (
                <span className="mt-2 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: '#D4AF37', boxShadow: '0 0 6px rgba(212,175,55,0.5)' }} />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0A1628] text-sm">{n.title || n.data?.title}</p>
                <p className="text-sm text-[#4A5568] mt-0.5">{n.message || n.data?.message}</p>
                <p className="text-xs text-[#8896A7] mt-1.5">{n.created_at?.substring(0, 16)}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {!n.read_at && (
                  <button onClick={() => markReadMutation.mutate(n.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#EBF0FA] text-[#081A3A] hover:bg-[#D4E0F5] transition-colors"
                    title="تحديد كمقروء">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button onClick={() => { if (confirm('حذف هذا الإشعار؟')) deleteMutation.mutate(n.id); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
