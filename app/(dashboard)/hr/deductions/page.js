'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { deductionsApi, attendanceApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/common/ErrorMessage';

/* ── helpers ─────────────────────────────────────────────── */
function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('ar-SA');
}

/* ── قسم أنواع الخصومات ──────────────────────────────────── */
function DeductionTypesSection({ tenantApi }) {
  const qc = useQueryClient();
  const [newType, setNewType]   = useState({ name: '', value: '' });
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState({ name: '', value: '' });
  const [error, setError]       = useState(null);

  const { data: types, isLoading } = useQuery({
    queryKey: ['deduction-types'],
    queryFn: () => deductionsApi.getTypes(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const createMutation = useMutation({
    mutationFn: () => deductionsApi.createType(tenantApi, { name: newType.name, value: Number(newType.value) }),
    onSuccess: () => { setNewType({ name: '', value: '' }); setError(null); qc.invalidateQueries({ queryKey: ['deduction-types'] }); },
    onError: (e) => setError(e),
  });

  const updateMutation = useMutation({
    mutationFn: () => deductionsApi.updateType(tenantApi, editId, { name: editForm.name, value: Number(editForm.value) }),
    onSuccess: () => { setEditId(null); qc.invalidateQueries({ queryKey: ['deduction-types'] }); },
    onError: (e) => setError(e),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deductionsApi.deleteType(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deduction-types'] }),
  });

  function startEdit(t) {
    setEditId(t.id);
    setEditForm({ name: t.name, value: t.value });
    setError(null);
  }

  const list = Array.isArray(types) ? types : types?.data ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-semibold text-gray-900 text-lg">أنواع الخصومات</h2>

      {/* نموذج الإضافة */}
      <ErrorMessage error={error} />
      <form
        onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(); }}
        className="flex gap-3 flex-wrap"
      >
        <input
          className="flex-1 min-w-0 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="اسم الخصم"
          value={newType.name}
          onChange={(e) => setNewType((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="w-28 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="القيمة ر.س"
          type="number"
          min="0"
          value={newType.value}
          onChange={(e) => setNewType((f) => ({ ...f, value: e.target.value }))}
          required
        />
        <Button type="submit" loading={createMutation.isPending}>إضافة</Button>
      </form>

      {/* القائمة */}
      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : list.length === 0 ? (
        <p className="text-center text-gray-400 py-4">لا توجد أنواع خصومات</p>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
          {list.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50">
              {editId === t.id ? (
                <>
                  <input
                    className="flex-1 h-9 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    className="w-24 h-9 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    type="number" min="0"
                    value={editForm.value}
                    onChange={(e) => setEditForm((f) => ({ ...f, value: e.target.value }))}
                  />
                  <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
                    className="text-green-600 hover:text-green-800 text-xs font-medium">
                    {updateMutation.isPending ? '...' : 'حفظ'}
                  </button>
                  <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600 text-xs">إلغاء</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-gray-900 text-sm">{t.name}</span>
                  <span className="text-gray-600 text-sm font-medium">{Number(t.value).toLocaleString()} ر.س</span>
                  <button onClick={() => startEdit(t)} className="text-indigo-600 hover:text-indigo-800 text-xs">تعديل</button>
                  <button onClick={() => { if (confirm('حذف هذا النوع؟')) deleteMutation.mutate(t.id); }}
                    className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── قسم سجلات الخصومات ──────────────────────────────────── */
function DeductionSheetsSection({ tenantApi }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ attendance_id: '', deduction_type_id: '', reason: '' });
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: sheets, isLoading } = useQuery({
    queryKey: ['deductions'],
    queryFn: () => deductionsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: types } = useQuery({
    queryKey: ['deduction-types'],
    queryFn: () => deductionsApi.getTypes(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: attendance } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => attendanceApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const createMutation = useMutation({
    mutationFn: () => deductionsApi.create(tenantApi, form),
    onSuccess: () => {
      setForm({ attendance_id: '', deduction_type_id: '', reason: '' });
      setShowForm(false);
      setError(null);
      qc.invalidateQueries({ queryKey: ['deductions'] });
    },
    onError: (e) => setError(e),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deductionsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deductions'] }),
  });

  const list      = Array.isArray(sheets) ? sheets : sheets?.data ?? [];
  const typesList = Array.isArray(types)  ? types  : types?.data  ?? [];
  const attList   = Array.isArray(attendance) ? attendance : attendance?.data ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-lg">سجلات الخصومات</h2>
        <Button size="sm" onClick={() => { setShowForm((v) => !v); setError(null); }}>
          {showForm ? 'إلغاء' : '+ إضافة خصم'}
        </Button>
      </div>

      {/* نموذج الإضافة */}
      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(); }}
          className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50"
        >
          <ErrorMessage error={error} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* سجل الحضور */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">سجل الحضور</label>
              <select
                value={form.attendance_id}
                onChange={(e) => setForm((f) => ({ ...f, attendance_id: e.target.value }))}
                required
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">اختر سجل الحضور</option>
                {attList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.employee?.name || `موظف #${a.employee_id}`} — {fmt(a.check_in)}
                  </option>
                ))}
              </select>
            </div>

            {/* نوع الخصم */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">نوع الخصم</label>
              <select
                value={form.deduction_type_id}
                onChange={(e) => setForm((f) => ({ ...f, deduction_type_id: e.target.value }))}
                required
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">اختر نوع الخصم</option>
                {typesList.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({Number(t.value).toLocaleString()} ر.س)</option>
                ))}
              </select>
            </div>
          </div>

          {/* سبب الخصم */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">السبب (اختياري)</label>
            <input
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="مثال: تأخير غير مبرر"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </div>

          <Button type="submit" loading={createMutation.isPending}>تطبيق الخصم</Button>
        </form>
      )}

      {/* الجدول */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : list.length === 0 ? (
        <p className="text-center text-gray-400 py-8">لا توجد سجلات خصومات</p>
      ) : (
        <div className="overflow-hidden border border-gray-100 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الموظف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ الحضور</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">نوع الخصم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المبلغ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الراتب بعد الخصم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">السبب</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {d.attendance?.employee?.name || `موظف #${d.attendance?.employee_id || '—'}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmt(d.attendance?.check_in)}</td>
                  <td className="px-4 py-3 text-gray-600">{d.deduction_type?.name || '—'}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{Number(d.amount || 0).toLocaleString()} ر.س</td>
                  <td className="px-4 py-3 text-gray-700">{Number(d.salary_after_deduction || 0).toLocaleString()} ر.س</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{d.reason || '—'}</td>
                  <td className="px-4 py-3 text-left">
                    <button
                      onClick={() => { if (confirm('حذف هذا الخصم؟')) deleteMutation.mutate(d.id); }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── الصفحة الرئيسية ─────────────────────────────────────── */
export default function DeductionsPage() {
  const { tenantApi } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">الخصومات</h1>
      <DeductionTypesSection tenantApi={tenantApi} />
      <DeductionSheetsSection tenantApi={tenantApi} />
    </div>
  );
}
