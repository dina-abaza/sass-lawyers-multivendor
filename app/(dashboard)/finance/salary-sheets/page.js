'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { salaryApi, employeesApi } from '@/lib/api';
import { QUERY_KEYS, PAYMENT_METHOD_OPTIONS } from '@/lib/constants';
import Spinner from '@/components/common/Spinner';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/common/ErrorMessage';

const thCls = 'text-right px-4 py-3.5 font-semibold text-[#4A5568] text-xs uppercase tracking-wide';
const inlineCls = 'w-full h-9 rounded-lg border border-[#E2E6F0] bg-[#F8F9FC] px-2.5 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors';
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
    <div className="p-4 sm:p-6 space-y-5">

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
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المالية</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>كشوف الرواتب</h1>
          </div>
        </div>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] text-sm mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          صرف راتب جديد
        </h2>
        <ErrorMessage error={error} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(form); }} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select label="الموظف" name="employee_id" value={form.employee_id} onChange={handleChange} options={empOptions} required />
            <Input label="المبلغ" name="amount" type="number" value={form.amount} onChange={handleChange} required />
            <Select label="طريقة الصرف" name="payment_method" value={form.payment_method} onChange={handleChange} options={PAYMENT_METHOD_OPTIONS} />
          </div>
          <button type="submit" disabled={createMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
            {createMutation.isPending
              ? <span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            صرف
          </button>
        </form>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
                <tr>
                  <th className={thCls}>الموظف</th>
                  <th className={thCls}>المبلغ</th>
                  <th className={thCls}>طريقة الصرف</th>
                  <th className={thCls}>ملاحظات</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {list.map((s) =>
                  editId === s.id ? (
                    <tr key={s.id} className="bg-[#F0F4FA]">
                      <td className="px-4 py-2.5">
                        <Select name="employee_id" value={editForm.employee_id} onChange={handleEditChange} options={empOptions} />
                      </td>
                      <td className="px-4 py-2.5">
                        <Input name="amount" type="number" value={editForm.amount} onChange={handleEditChange} />
                      </td>
                      <td className="px-4 py-2.5">
                        <Select name="payment_method" value={editForm.payment_method} onChange={handleEditChange} options={PAYMENT_METHOD_OPTIONS} />
                      </td>
                      <td className="px-4 py-2.5">
                        <input name="notes" value={editForm.notes} onChange={handleEditChange} className={inlineCls} />
                      </td>
                      <td className="px-4 py-2.5">
                        {editError && <p className="text-xs text-red-500 mb-1">{editError?.message || 'خطأ'}</p>}
                        <div className="flex gap-2">
                          <button onClick={() => updateMutation.mutate({ id: s.id, data: editForm })}
                            disabled={updateMutation.isPending}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A' }}>
                            حفظ
                          </button>
                          <button onClick={() => setEditId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-white transition-colors">
                            إلغاء
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={s.id} className="hover:bg-[#F8F9FC] transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-[#0A1628]">{s.employee?.name || s.employee_id}</td>
                      <td className="px-4 py-3.5 font-bold text-[#0A1628]">{Number(s.amount).toLocaleString()} ر.س</td>
                      <td className="px-4 py-3.5 text-[#4A5568]">{PAYMENT_LABEL[s.payment_method] || s.payment_method}</td>
                      <td className="px-4 py-3.5 text-[#4A5568]">{s.notes || '—'}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(s)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#EBF0FA] text-[#081A3A] hover:bg-[#D4E0F5] transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(s.id); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-[#8896A7] text-sm">لا توجد سجلات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
