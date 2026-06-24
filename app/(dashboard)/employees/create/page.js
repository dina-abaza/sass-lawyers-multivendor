'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { rolesApi, departmentsApi } from '@/lib/api';
import { QUERY_KEYS, PAYMENT_METHOD_OPTIONS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

// أدوار النظام الأساسية لا تُعطى للموظفين
const EXCLUDED_ROLES = ['super_admin', 'owner'];

export default function CreateEmployeePage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    department_id: '',
    amount: '',
    payment_method: '',
    notes: '',
    role: 'user',
  });
  const [error, setError] = useState(null);

  const { data: departments } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: () => departmentsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: () => rolesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { role, ...employeeData } = data;

      // الخطوة 1: إنشاء الموظف (يُنشئ المستخدم تلقائياً بدور "user")
      const res = await tenantApi.post('/employees', employeeData);

      // الخطوة 2: إذا كان الدور مختلفاً عن "user"، نُحدّث دور المستخدم المُنشأ
      if (role && role !== 'user') {
        const userId = res.data?.data?.employee?.user_id;
        if (userId) {
          await tenantApi.put(`/admin/users/${userId}`, { roles: [role] });
        }
      }

      return res;
    },
    onSuccess: () => router.push('/employees'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(form);
  };

  function deptOptions() {
    const list = Array.isArray(departments) ? departments : departments?.data ?? [];
    return list.map((d) => ({ value: d.id, label: d.name_ar || d.name_en || d.name }));
  }

  function roleOptions() {
    const list = rolesData?.data ?? [];
    return list
      .filter((r) => !EXCLUDED_ROLES.includes(r.name))
      .map((r) => ({ value: r.name, label: r.name }));
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/employees">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">موظف جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
          سيتم إنشاء حساب مستخدم تلقائياً بكلمة المرور الافتراضية:{' '}
          <span className="font-mono font-bold text-blue-700">12345678</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الاسم الكامل" name="name" value={form.name} onChange={handleChange} required />
          <Input label="البريد الإلكتروني" name="email" type="email" value={form.email} onChange={handleChange} required dir="ltr" />
        </div>

        <Select
          label="القسم"
          name="department_id"
          value={form.department_id}
          onChange={handleChange}
          options={deptOptions()}
          required
        />

        {/* دور الموظف — يُجلب من الـ API */}
        <div className="space-y-1">
          {loadingRoles ? (
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <Select
              label="دور الموظف"
              name="role"
              value={form.role}
              onChange={handleChange}
              options={roleOptions()}
              required
            />
          )}
          {form.role === 'lawyer' && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
              سيظهر هذا الموظف في قائمة "اختر محامي" عند إنشاء القضايا
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الراتب الشهري (ر.س)" name="amount" type="number" value={form.amount} onChange={handleChange} required />
          <Select label="طريقة الصرف" name="payment_method" value={form.payment_method} onChange={handleChange} options={PAYMENT_METHOD_OPTIONS} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea
            name="notes"
            rows={2}
            value={form.notes}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>إضافة الموظف</Button>
          <Link href="/employees"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
