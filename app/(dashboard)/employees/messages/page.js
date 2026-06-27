'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { employeesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const fieldCls = 'w-full border border-[#E2E6F0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] bg-white transition-colors text-[#0A1628] placeholder:text-[#8896A7]';
const labelCls = 'text-sm font-medium text-[#4A5568] mb-1.5 block';

export default function EmployeeMessagesPage() {
  const { tenantApi } = useAuth();
  const [activeTab, setActiveTab] = useState('staff');

  const [staffForm, setStaffForm] = useState({ subject: '', message: '' });
  const [staffSuccess, setStaffSuccess] = useState(false);
  const [staffError, setStaffError] = useState(null);

  const [directForm, setDirectForm] = useState({ employee_ids: [], subject: '', message: '' });
  const [directSuccess, setDirectSuccess] = useState(false);
  const [directError, setDirectError] = useState(null);

  const { data: empData, isLoading: empLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });
  const employees = Array.isArray(empData) ? empData : empData?.data ?? [];

  const staffMutation = useMutation({
    mutationFn: () => employeesApi.sendStaffMessage(tenantApi, staffForm),
    onSuccess: () => {
      setStaffSuccess(true);
      setStaffError(null);
      setStaffForm({ subject: '', message: '' });
      setTimeout(() => setStaffSuccess(false), 4000);
    },
    onError: (err) => {
      setStaffError(err?.response?.data?.message || 'حدث خطأ أثناء الإرسال');
      setStaffSuccess(false);
    },
  });

  const directMutation = useMutation({
    mutationFn: () => employeesApi.sendDirectMessage(tenantApi, directForm),
    onSuccess: () => {
      setDirectSuccess(true);
      setDirectError(null);
      setDirectForm({ employee_ids: [], subject: '', message: '' });
      setTimeout(() => setDirectSuccess(false), 4000);
    },
    onError: (err) => {
      setDirectError(err?.response?.data?.message || 'حدث خطأ أثناء الإرسال');
      setDirectSuccess(false);
    },
  });

  const toggleEmployee = (id) => {
    setDirectForm((prev) => ({
      ...prev,
      employee_ids: prev.employee_ids.includes(id)
        ? prev.employee_ids.filter((x) => x !== id)
        : [...prev.employee_ids, id],
    }));
  };

  const selectAll = () => setDirectForm((prev) => ({ ...prev, employee_ids: employees.map((e) => e.id) }));
  const clearAll  = () => setDirectForm((prev) => ({ ...prev, employee_ids: [] }));

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الموظفون</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>رسائل الموظفين</h1>
            <p className="text-white/50 text-sm mt-0.5">إرسال رسائل داخلية للموظفين</p>
          </div>
        </div>
      </div>

      {/* تبويبات */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
        <div className="flex border-b border-[#E2E6F0]">
          {[
            { key: 'staff',  label: 'رسالة لجميع الموظفين' },
            { key: 'direct', label: 'رسالة لموظفين محددين' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#081A3A] text-[#081A3A] bg-[#F8F9FC]'
                  : 'border-transparent text-[#8896A7] hover:text-[#4A5568]'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* رسالة جماعية */}
          {activeTab === 'staff' && (
            <form onSubmit={(e) => { e.preventDefault(); setStaffError(null); staffMutation.mutate(); }}
              className="space-y-4">
              <p className="text-sm text-[#8896A7] flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                سيتم إرسال هذه الرسالة لجميع موظفي المكتب
              </p>

              <div>
                <label className={labelCls}>الموضوع <span className="text-red-500">*</span></label>
                <input value={staffForm.subject}
                  onChange={(e) => setStaffForm((p) => ({ ...p, subject: e.target.value }))}
                  required placeholder="مثال: اجتماع طارئ للموظفين"
                  className={fieldCls} />
              </div>

              <div>
                <label className={labelCls}>نص الرسالة <span className="text-red-500">*</span></label>
                <textarea value={staffForm.message}
                  onChange={(e) => setStaffForm((p) => ({ ...p, message: e.target.value }))}
                  required rows={5} placeholder="اكتب نص الرسالة هنا..."
                  className={`${fieldCls} resize-none`} />
              </div>

              {staffError && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {staffError}
                </div>
              )}
              {staffSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  تم إرسال الرسالة لجميع الموظفين بنجاح
                </div>
              )}

              <button type="submit" disabled={staffMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff' }}>
                {staffMutation.isPending ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                إرسال للجميع
              </button>
            </form>
          )}

          {/* رسالة مباشرة */}
          {activeTab === 'direct' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (directForm.employee_ids.length === 0) { setDirectError('يجب اختيار موظف واحد على الأقل'); return; }
                setDirectError(null);
                directMutation.mutate();
              }}
              className="space-y-4">
              <p className="text-sm text-[#8896A7] flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                اختر الموظفين الذين تريد إرسال الرسالة إليهم
              </p>

              {/* اختيار الموظفين */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[#4A5568]">الموظفون <span className="text-red-500">*</span></label>
                  <div className="flex gap-3">
                    <button type="button" onClick={selectAll}
                      className="text-xs font-medium text-[#D4AF37] hover:text-[#B8961F] transition-colors">تحديد الكل</button>
                    <button type="button" onClick={clearAll}
                      className="text-xs font-medium text-[#8896A7] hover:text-[#4A5568] transition-colors">إلغاء التحديد</button>
                  </div>
                </div>

                <div className="border border-[#E2E6F0] rounded-xl p-3 max-h-44 overflow-y-auto space-y-1.5 bg-[#F8F9FC]">
                  {empLoading ? (
                    <div className="flex justify-center py-4"><Spinner /></div>
                  ) : employees.length === 0 ? (
                    <p className="text-sm text-[#8896A7] text-center py-2">لا يوجد موظفون</p>
                  ) : employees.map((emp) => (
                    <label key={emp.id}
                      className="flex items-center gap-2.5 cursor-pointer text-sm text-[#4A5568] hover:text-[#0A1628] px-2 py-1.5 rounded-lg hover:bg-white transition-colors">
                      <input type="checkbox" checked={directForm.employee_ids.includes(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                        className="rounded accent-[#081A3A]" />
                      <span className="font-medium">{emp.name}</span>
                      {emp.department?.name_ar && (
                        <span className="text-xs text-[#8896A7]">— {emp.department.name_ar}</span>
                      )}
                    </label>
                  ))}
                </div>

                {directForm.employee_ids.length > 0 && (
                  <p className="text-xs text-[#D4AF37] font-semibold mt-1.5">
                    تم اختيار {directForm.employee_ids.length} موظف
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>الموضوع <span className="text-red-500">*</span></label>
                <input value={directForm.subject}
                  onChange={(e) => setDirectForm((p) => ({ ...p, subject: e.target.value }))}
                  required placeholder="مثال: تعديل في موعد الجلسة"
                  className={fieldCls} />
              </div>

              <div>
                <label className={labelCls}>نص الرسالة <span className="text-red-500">*</span></label>
                <textarea value={directForm.message}
                  onChange={(e) => setDirectForm((p) => ({ ...p, message: e.target.value }))}
                  required rows={5} placeholder="اكتب نص الرسالة هنا..."
                  className={`${fieldCls} resize-none`} />
              </div>

              {directError && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {directError}
                </div>
              )}
              {directSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  تم إرسال الرسالة بنجاح
                </div>
              )}

              <button type="submit"
                disabled={directMutation.isPending || directForm.employee_ids.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff' }}>
                {directMutation.isPending ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                إرسال الرسالة
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
