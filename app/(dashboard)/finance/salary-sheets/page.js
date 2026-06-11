'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { salaryApi, employeesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/common/ErrorMessage';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'نقداً' },
  { value: 'bank', label: 'تحويل بنكي' },
  { value: 'wallet', label: 'محفظة إلكترونية' },
];

export default function SalarySheetsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ employee_id: '', amount: '', payment_method: 'cash', notes: '' });
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['salary-sheets'],
    queryFn: () => salaryApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => employeesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const createMutation = useMutation({
    mutationFn: (data) => salaryApi.create(tenantApi, data),
    onSuccess: () => { setForm({ employee_id: '', amount: '', payment_method: 'cash', notes: '' }); qc.invalidateQueries({ queryKey: ['salary-sheets'] }); },
    onError: setError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => salaryApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salary-sheets'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];
  const empOptions = (() => {
    const l = Array.isArray(employees) ? employees : employees?.data ?? [];
    return l.map((e) => ({ value: e.id, label: e.name }));
  })();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">كشوف الرواتب</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">صرف راتب جديد</h2>
        <ErrorMessage error={error} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(form); }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select label="الموظف" name="employee_id" value={form.employee_id} onChange={handleChange} options={empOptions} required />
          <Input label="المبلغ" name="amount" type="number" value={form.amount} onChange={handleChange} required />
          <Select label="طريقة الصرف" name="payment_method" value={form.payment_method} onChange={handleChange} options={PAYMENT_METHODS} />
          <div className="flex items-end">
            <Button type="submit" loading={createMutation.isPending} className="w-full">صرف</Button>
          </div>
        </form>
      </div>

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
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{s.employee?.name || s.employee_id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.amount?.toLocaleString()} ر.س</td>
                  <td className="px-4 py-3 text-gray-600">{s.payment_method}</td>
                  <td className="px-4 py-3 text-gray-600">{s.notes}</td>
                  <td className="px-4 py-3 text-left">
                    <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(s.id); }}
                      className="text-red-600 hover:text-red-800 text-xs">حذف</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">لا توجد سجلات</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
