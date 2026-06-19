'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { accountsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

// الحسابات المطلوبة لعمل نظام القضايا والفواتير
const REQUIRED_ACCOUNTS = [
  { name: 'عملاء القضايا',    status: 'debitor'  },
  { name: 'إيرادات القضايا',  status: 'creditor' },
  { name: 'الضرائب المستحقة', status: 'creditor' },
];

const STATUS_OPTIONS = [
  { value: 'debitor',  label: 'مدين'  },
  { value: 'creditor', label: 'دائن'  },
];

function AccountNode({ account, depth = 0, onDelete }) {
  const children = account.children || [];
  return (
    <div>
      <div
        className={`flex items-center justify-between py-2.5 px-4 hover:bg-gray-50 border-b border-gray-100 ${depth > 0 ? 'bg-gray-50/50' : ''}`}
        style={{ paddingRight: `${16 + depth * 24}px` }}
      >
        <span className="text-sm text-gray-900 font-medium">{account.name}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${account.status === 'creditor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {account.status === 'creditor' ? 'دائن' : 'مدين'}
          </span>
          {children.length === 0 && (
            <button
              onClick={() => onDelete(account.id)}
              className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="حذف"
            >
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

  // إضافة حساب واحد
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

  // حذف حساب
  const deleteMutation = useMutation({
    mutationFn: (id) => accountsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });

  // إعداد سريع — ينشئ الحسابات الثلاثة المطلوبة للقضايا
  const setupMutation = useMutation({
    mutationFn: async () => {
      // جلب الأسماء الموجودة لتجنب التكرار
      const existing = list.map((a) => a.name);
      const toCreate = REQUIRED_ACCOUNTS.filter((a) => !existing.includes(a.name));
      for (const acc of toCreate) {
        await accountsApi.create(tenantApi, acc);
      }
      return toCreate.length;
    },
    onSuccess: (count) => {
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

  // الحسابات المطلوبة المفقودة
  const existingNames = list.map((a) => a.name);
  const missingRequired = REQUIRED_ACCOUNTS.filter((a) => !existingNames.includes(a.name));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">شجرة الحسابات</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة حساب
        </Button>
      </div>

      {/* تنبيه الإعداد السريع */}
      {!isLoading && missingRequired.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">الحسابات المطلوبة لإضافة القضايا غير موجودة</p>
              <p className="text-xs text-amber-700 mt-0.5">
                يحتاج النظام للحسابات التالية لإنشاء الفواتير تلقائياً عند إضافة قضية:
              </p>
              <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                {missingRequired.map((a) => (
                  <li key={a.name} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    {a.name} ({a.status === 'creditor' ? 'دائن' : 'مدين'})
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ErrorMessage error={setupError} />
          {setupDone && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
              ✓ تم إنشاء الحسابات المطلوبة — يمكنك الآن إضافة القضايا
            </p>
          )}
          <Button
            onClick={() => setupMutation.mutate()}
            loading={setupMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm"
          >
            إعداد سريع — إنشاء الحسابات الثلاثة تلقائياً
          </Button>
        </div>
      )}

      {/* فورم إضافة حساب */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">حساب جديد</h2>
          <ErrorMessage error={formError} />
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-700 mb-1 block">اسم الحساب</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="مثال: عملاء القضايا"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">النوع</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
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
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {list.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-sm">لا توجد حسابات — استخدم الإعداد السريع أو أضف حساباً يدوياً</p>
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
