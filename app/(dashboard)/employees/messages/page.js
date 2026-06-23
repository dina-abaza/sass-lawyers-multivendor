'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { employeesApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Spinner from '@/components/common/Spinner';

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
  const clearAll = () => setDirectForm((prev) => ({ ...prev, employee_ids: [] }));

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">رسائل الموظفين</h1>

      {/* تبويبات */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'staff' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          رسالة لجميع الموظفين
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'direct' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          رسالة مباشرة لموظفين محددين
        </button>
      </div>

      {/* رسالة جماعية */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-5">سيتم إرسال هذه الرسالة لجميع موظفي المكتب</p>
          <form
            onSubmit={(e) => { e.preventDefault(); setStaffError(null); staffMutation.mutate(); }}
            className="space-y-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">الموضوع <span className="text-red-500">*</span></label>
              <input
                value={staffForm.subject}
                onChange={(e) => setStaffForm((p) => ({ ...p, subject: e.target.value }))}
                required
                placeholder="مثال: اجتماع طارئ للموظفين"
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">نص الرسالة <span className="text-red-500">*</span></label>
              <textarea
                value={staffForm.message}
                onChange={(e) => setStaffForm((p) => ({ ...p, message: e.target.value }))}
                required
                rows={5}
                placeholder="اكتب نص الرسالة هنا..."
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {staffError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{staffError}</p>}
            {staffSuccess && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">✓ تم إرسال الرسالة لجميع الموظفين بنجاح</p>}

            <Button type="submit" loading={staffMutation.isPending}>إرسال للجميع</Button>
          </form>
        </div>
      )}

      {/* رسالة مباشرة */}
      {activeTab === 'direct' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-5">اختر الموظفين الذين تريد إرسال الرسالة إليهم</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (directForm.employee_ids.length === 0) { setDirectError('يجب اختيار موظف واحد على الأقل'); return; }
              setDirectError(null);
              directMutation.mutate();
            }}
            className="space-y-4"
          >
            {/* اختيار الموظفين */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">الموظفون <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  <button type="button" onClick={selectAll} className="text-xs text-blue-600 hover:underline">تحديد الكل</button>
                  <button type="button" onClick={clearAll} className="text-xs text-gray-400 hover:underline">إلغاء التحديد</button>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {empLoading ? (
                  <div className="flex justify-center py-4"><Spinner /></div>
                ) : employees.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-2">لا يوجد موظفون</p>
                ) : employees.map((emp) => (
                  <label key={emp.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={directForm.employee_ids.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="rounded"
                    />
                    <span>{emp.name}</span>
                    {emp.department?.name_ar && (
                      <span className="text-xs text-gray-400">— {emp.department.name_ar}</span>
                    )}
                  </label>
                ))}
              </div>

              {directForm.employee_ids.length > 0 && (
                <p className="text-xs text-blue-600">تم اختيار {directForm.employee_ids.length} موظف</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">الموضوع <span className="text-red-500">*</span></label>
              <input
                value={directForm.subject}
                onChange={(e) => setDirectForm((p) => ({ ...p, subject: e.target.value }))}
                required
                placeholder="مثال: تعديل في موعد الجلسة"
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">نص الرسالة <span className="text-red-500">*</span></label>
              <textarea
                value={directForm.message}
                onChange={(e) => setDirectForm((p) => ({ ...p, message: e.target.value }))}
                required
                rows={5}
                placeholder="اكتب نص الرسالة هنا..."
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {directError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{directError}</p>}
            {directSuccess && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">✓ تم إرسال الرسالة بنجاح</p>}

            <Button type="submit" loading={directMutation.isPending} disabled={directForm.employee_ids.length === 0}>
              إرسال الرسالة
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
