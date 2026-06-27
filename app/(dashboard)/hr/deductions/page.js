'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { deductionsApi, attendanceApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('ar-SA');
}

const inputCls = 'h-10 rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors';
const thCls    = 'text-right px-4 py-3.5 font-semibold text-[#4A5568] text-xs uppercase tracking-wide';

/* ── أنواع الخصومات ──────────────────────────────────────── */
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

  function startEdit(t) { setEditId(t.id); setEditForm({ name: t.name, value: t.value }); setError(null); }

  const list = Array.isArray(types) ? types : types?.data ?? [];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)] space-y-4">
      <h2 className="font-semibold text-[#0A1628] flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
        أنواع الخصومات
      </h2>

      <ErrorMessage error={error} />
      <form onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(); }}
        className="flex gap-3 flex-wrap">
        <input className={`flex-1 min-w-0 ${inputCls}`} placeholder="اسم الخصم"
          value={newType.name} onChange={(e) => setNewType((f) => ({ ...f, name: e.target.value }))} required />
        <input className={`w-28 ${inputCls}`} placeholder="القيمة ر.س" type="number" min="0"
          value={newType.value} onChange={(e) => setNewType((f) => ({ ...f, value: e.target.value }))} required />
        <button type="submit" disabled={createMutation.isPending}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A' }}>
          {createMutation.isPending ? '...' : 'إضافة'}
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : list.length === 0 ? (
        <p className="text-center text-[#8896A7] py-4 text-sm">لا توجد أنواع خصومات</p>
      ) : (
        <div className="divide-y divide-[#F0F2F7] border border-[#E2E6F0] rounded-xl overflow-hidden">
          {list.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8F9FC] transition-colors">
              {editId === t.id ? (
                <>
                  <input className={`flex-1 h-9 ${inputCls}`} value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                  <input className={`w-24 h-9 ${inputCls}`} type="number" min="0" value={editForm.value}
                    onChange={(e) => setEditForm((f) => ({ ...f, value: e.target.value }))} />
                  <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
                    className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold">
                    {updateMutation.isPending ? '...' : 'حفظ'}
                  </button>
                  <button onClick={() => setEditId(null)} className="text-[#8896A7] hover:text-[#4A5568] text-xs">إلغاء</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[#0A1628] text-sm font-medium">{t.name}</span>
                  <span className="text-[#4A5568] text-sm font-semibold">{Number(t.value).toLocaleString()} ر.س</span>
                  <button onClick={() => startEdit(t)} className="text-[#081A3A] hover:text-[#D4AF37] text-xs font-medium transition-colors">تعديل</button>
                  <button onClick={() => { if (confirm('حذف هذا النوع؟')) deleteMutation.mutate(t.id); }}
                    className="text-red-500 hover:text-red-700 text-xs font-medium">حذف</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── سجلات الخصومات ──────────────────────────────────────── */
function DeductionSheetsSection({ tenantApi }) {
  const qc = useQueryClient();
  const [form, setForm]       = useState({ attendance_id: '', deduction_type_id: '', reason: '' });
  const [error, setError]     = useState(null);
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
      setShowForm(false); setError(null);
      qc.invalidateQueries({ queryKey: ['deductions'] });
    },
    onError: (e) => setError(e),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deductionsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deductions'] }),
  });

  const list      = Array.isArray(sheets)     ? sheets     : sheets?.data     ?? [];
  const typesList = Array.isArray(types)      ? types      : types?.data      ?? [];
  const attList   = Array.isArray(attendance) ? attendance : attendance?.data ?? [];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#0A1628] flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          سجلات الخصومات
        </h2>
        <button onClick={() => { setShowForm((v) => !v); setError(null); }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
          style={showForm
            ? { background: '#F8F9FC', color: '#4A5568', border: '1px solid #E2E6F0' }
            : { background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
          {showForm ? 'إلغاء' : '+ إضافة خصم'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(); }}
          className="rounded-2xl border border-[#E2E6F0] bg-[#F8F9FC] p-4 space-y-3">
          <ErrorMessage error={error} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#4A5568]">سجل الحضور</label>
              <select value={form.attendance_id}
                onChange={(e) => setForm((f) => ({ ...f, attendance_id: e.target.value }))}
                required className={inputCls + ' w-full'}>
                <option value="">اختر سجل الحضور</option>
                {attList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.employee?.name || `موظف #${a.employee_id}`} — {fmt(a.check_in)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#4A5568]">نوع الخصم</label>
              <select value={form.deduction_type_id}
                onChange={(e) => setForm((f) => ({ ...f, deduction_type_id: e.target.value }))}
                required className={inputCls + ' w-full'}>
                <option value="">اختر نوع الخصم</option>
                {typesList.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({Number(t.value).toLocaleString()} ر.س)</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#4A5568]">السبب (اختياري)</label>
            <input className={inputCls + ' w-full'} placeholder="مثال: تأخير غير مبرر"
              value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          </div>
          <button type="submit" disabled={createMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff' }}>
            {createMutation.isPending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : null}
            تطبيق الخصم
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Spinner /></div>
      ) : list.length === 0 ? (
        <p className="text-center text-[#8896A7] py-8 text-sm">لا توجد سجلات خصومات</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E2E6F0]">
          <table className="w-full text-sm">
            <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
              <tr>
                <th className={thCls}>الموظف</th>
                <th className={thCls}>تاريخ الحضور</th>
                <th className={thCls}>نوع الخصم</th>
                <th className={thCls}>المبلغ</th>
                <th className={thCls}>الراتب بعد الخصم</th>
                <th className={thCls}>السبب</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F7]">
              {list.map((d) => (
                <tr key={d.id} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-[#0A1628]">
                    {d.attendance?.employee?.name || `موظف #${d.attendance?.employee_id || '—'}`}
                  </td>
                  <td className="px-4 py-3.5 text-[#4A5568]">{fmt(d.attendance?.check_in)}</td>
                  <td className="px-4 py-3.5 text-[#4A5568]">{d.deduction_type?.name || '—'}</td>
                  <td className="px-4 py-3.5 font-semibold text-red-600">{Number(d.amount || 0).toLocaleString()} ر.س</td>
                  <td className="px-4 py-3.5 text-[#0A1628]">{Number(d.salary_after_deduction || 0).toLocaleString()} ر.س</td>
                  <td className="px-4 py-3.5 text-[#8896A7] max-w-xs truncate">{d.reason || '—'}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => { if (confirm('حذف هذا الخصم؟')) deleteMutation.mutate(d.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الموارد البشرية</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>الخصومات</h1>
          </div>
        </div>
      </div>

      <DeductionTypesSection tenantApi={tenantApi} />
      <DeductionSheetsSection tenantApi={tenantApi} />
    </div>
  );
}
