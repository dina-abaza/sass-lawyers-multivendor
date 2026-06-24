'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { salaryApi, employeesApi } from '@/lib/api';
import { QUERY_KEYS, PAYMENT_METHOD_OPTIONS } from '@/lib/constants';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/common/ErrorMessage';

const PAYMENT_LABEL = { cash: 'نقداً', bank: 'تحويل بنكي', wallet: 'محفظة إلكترونية' };

const EMPTY_FORM = { employee_id: '', amount: '', payment_method: 'cash', notes: '' };

export default function SalarySheetsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [editError, setEditError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SALARY_SHEETS],
    queryFn: () => salaryApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: employees } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES],
    queryFn: () => employeesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const createMutation = useMutation({
    mutationFn: (data) => salaryApi.create(tenantApi, data),
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setError(null);
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.SALARY_SHEETS] });
    },
    onError: setError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => salaryApi.update(tenantApi, id, data),
    onSuccess: () => {
      setEditId(null);
      setEditError(null);
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.SALARY_SHEETS] });
    },
    onError: setEditError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => salaryApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.SALARY_SHEETS] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];
  const empOptions = (() => {
    const l = Array.isArray(employees) ? employees : employees?.data ?? [];
    return l.map((e) => ({ value: e.id, label: e.name }));
  })();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditChange = (e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function openEdit(s) {
    setEditId(s.id);
    setEditError(null);
    setEditForm({
      employee_id: s.employee_id ?? '',
      amount: s.amount ?? '',
      payment_method: s.payment_method ?? 'cash',
      notes: s.notes ?? '',
    });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">كشوف الرواتب</h1>

      {/* فورم الإضافة */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">صرف راتب جديد</h2>
        <ErrorMessage error={error} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(form); }}
          className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select label="الموظف" name="employee_id" value={form.employee_id} onChange={handleChange} options={empOptions} required />
            <Input label="المبلغ" name="amount" type="number" value={form.amount} onChange={handleChange} required />
            <Select label="طريقة الصرف" name="payment_method" value={form.payment_method} onChange={handleChange} options={PAYMENT_METHOD_OPTIONS} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">ملاحظات</label>
            <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <Button type="submit" loading={createMutation.isPending}>صرف</Button>
        </form>
      </div>

      {/* الجدول */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الموظف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المبلغ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">طريقة الصرف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">ملاحظات</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((s) =>
                editId === s.id ? (
                  <tr key={s.id} className="bg-blue-50">
                    <td className="px-4 py-2">
                      <Select name="employee_id" value={editForm.employee_id} onChange={handleEditChange} options={empOptions} />
                    </td>
                    <td className="px-4 py-2">
                      <Input name="amount" type="number" value={editForm.amount} onChange={handleEditChange} />
                    </td>
                    <td className="px-4 py-2">
                      <Select name="payment_method" value={editForm.payment_method} onChange={handleEditChange} options={PAYMENT_METHOD_OPTIONS} />
                    </td>
                    <td className="px-4 py-2">
                      <input name="notes" value={editForm.notes} onChange={handleEditChange}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </td>
                    <td className="px-4 py-2">
                      {editError && <p className="text-xs text-red-500 mb-1">{editError?.message || 'خطأ'}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => updateMutation.mutate({ id: s.id, data: editForm })}
                          disabled={updateMutation.isPending}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium">حفظ</button>
                        <button onClick={() => setEditId(null)} className="text-gray-500 hover:text-gray-700 text-xs">إلغاء</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{s.employee?.name || s.employee_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{Number(s.amount).toLocaleString()} ر.س</td>
                    <td className="px-4 py-3 text-gray-600">{PAYMENT_LABEL[s.payment_method] || s.payment_method}</td>
                    <td className="px-4 py-3 text-gray-600">{s.notes || '—'}</td>
                    <td className="px-4 py-3 text-left flex gap-3">
                      <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 text-xs">تعديل</button>
                      <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(s.id); }}
                        className="text-red-600 hover:text-red-800 text-xs">حذف</button>
                    </td>
                  </tr>
                )
              )}
              {list.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">لا توجد سجلات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
