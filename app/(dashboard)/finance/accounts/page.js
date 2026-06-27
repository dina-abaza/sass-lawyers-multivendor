'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const REQUIRED_ACCOUNTS = [
  { name: 'عملاء القضايا',    status: 'debitor'  },
  { name: 'إيرادات القضايا',  status: 'creditor' },
  { name: 'الضرائب المستحقة', status: 'creditor' },
];

const STATUS_OPTIONS = [
  { value: 'debitor',  label: 'مدين'  },
  { value: 'creditor', label: 'دائن'  },
];

const fieldCls = 'w-full border border-[#E2E6F0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] bg-white transition-colors text-[#0A1628] placeholder:text-[#8896A7]';

function AccountNode({ account, depth = 0, onDelete }) {
  const children = account.children || [];
  return (
    <div>
      <div
        className={`flex items-center justify-between py-3 hover:bg-[#F8F9FC] transition-colors border-b border-[#F0F2F7] ${depth > 0 ? 'bg-[#F8F9FC]/60' : ''}`}
        style={{ paddingRight: `${16 + depth * 24}px`, paddingLeft: '16px' }}
      >
        <div className="flex items-center gap-2">
          {depth > 0 && <span className="w-1 h-1 rounded-full bg-[#8896A7] shrink-0" />}
          <span className="text-sm text-[#0A1628] font-medium">{account.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
            account.status === 'creditor'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-[#EBF0FA] text-[#081A3A] border-[#081A3A]/10'
          }`}>
            {account.status === 'creditor' ? 'دائن' : 'مدين'}
          </span>
          {children.length === 0 && (
            <button onClick={() => onDelete(account.id)}
              className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {children.map((child) => (
        <AccountNode key={child.id} account={child} depth={depth + 1} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default function AccountsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', status: 'debitor', parent_id: '' });
  const [formError, setFormError] = useState(null);
  const [setupError, setSetupError] = useState(null);
  const [setupDone, setSetupDone] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (d) => accountsApi.create(tenantApi, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      setForm({ name: '', status: 'debitor', parent_id: '' });
      setShowForm(false);
      setFormError(null);
    },
    onError: setFormError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => accountsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const setupMutation = useMutation({
    mutationFn: async () => {
      const existing = list.map((a) => a.name);
      const toCreate = REQUIRED_ACCOUNTS.filter((a) => !existing.includes(a.name));
      for (const acc of toCreate) await accountsApi.create(tenantApi, acc);
      return toCreate.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      setSetupError(null);
      setSetupDone(true);
    },
    onError: setSetupError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    const payload = { name: form.name, status: form.status };
    if (form.parent_id) payload.parent_id = form.parent_id;
    createMutation.mutate(payload);
  };

  const handleDelete = (id) => {
    if (confirm('حذف هذا الحساب؟')) deleteMutation.mutate(id);
  };

  const existingNames = list.map((a) => a.name);
  const missingRequired = REQUIRED_ACCOUNTS.filter((a) => !existingNames.includes(a.name));

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المالية</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>شجرة الحسابات</h1>
              <p className="text-white/50 text-sm mt-0.5">إدارة الحسابات المالية للمكتب</p>
            </div>
          </div>
          <button onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shrink-0"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة حساب
          </button>
        </div>
      </div>

      {/* تنبيه الإعداد السريع */}
      {!isLoading && missingRequired.length > 0 && (
        <div className="bg-[#FDF8E7] border border-[#D4AF37]/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#B8961F] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0A1628]">الحسابات المطلوبة لإضافة القضايا غير موجودة</p>
              <p className="text-xs text-[#4A5568] mt-0.5">يحتاج النظام للحسابات التالية لإنشاء الفواتير تلقائياً عند إضافة قضية:</p>
              <ul className="text-xs text-[#4A5568] mt-1 space-y-0.5">
                {missingRequired.map((a) => (
                  <li key={a.name} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block" />
                    {a.name} ({a.status === 'creditor' ? 'دائن' : 'مدين'})
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ErrorMessage error={setupError} />
          {setupDone && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              ✓ تم إنشاء الحسابات المطلوبة — يمكنك الآن إضافة القضايا
            </p>
          )}
          <Button onClick={() => setupMutation.mutate()} loading={setupMutation.isPending}>
            إعداد سريع — إنشاء الحسابات الثلاثة تلقائياً
          </Button>
        </div>
      )}

      {/* فورم إضافة حساب */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
            حساب جديد
          </h2>
          <ErrorMessage error={formError} />
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#4A5568] mb-1.5 block">اسم الحساب</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  placeholder="مثال: عملاء القضايا" className={fieldCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-[#4A5568] mb-1.5 block">النوع</label>
                <select name="status" value={form.status} onChange={handleChange} className={fieldCls}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={createMutation.isPending}>إضافة</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            </div>
          </form>
        </div>
      )}

      {/* شجرة الحسابات */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] overflow-hidden shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          {list.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#F8F9FC] border border-[#E2E6F0] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#8896A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-sm text-[#8896A7]">لا توجد حسابات — استخدم الإعداد السريع أو أضف حساباً يدوياً</p>
            </div>
          ) : (
            list.map((account) => (
              <AccountNode key={account.id} account={account} onDelete={handleDelete} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
