'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { rolesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/common/ErrorMessage';

const EXCLUDED_ROLES = ['super_admin', 'owner'];

function getCurrentRoleName(userRoles = []) {
  const names = userRoles.map((r) => (typeof r === 'string' ? r : r.name));
  // نُعيد أول دور ليس من أدوار النظام الأساسية
  return names.find((n) => !EXCLUDED_ROLES.includes(n)) ?? names[0] ?? 'user';
}

export default function EmployeeDetailPage({ params }) {
  const { id } = use(params);
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [roleError, setRoleError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null); // null = لم يُحدَّد بعد

  // بيانات الموظف
  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => tenantApi.get(`/employees/${id}`).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const userId = employee?.user_id;

  // بيانات المستخدم المرتبط (لجلب الأدوار الحالية)
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['employee-user', userId],
    queryFn: () => tenantApi.get(`/admin/users/${userId}`).then((r) => r.data),
    enabled: !!tenantApi && !!userId,
    onSuccess: (d) => {
      const roles = d?.data?.roles ?? [];
      if (selectedRole === null) {
        setSelectedRole(getCurrentRoleName(roles));
      }
    },
  });

  // قائمة الأدوار المتاحة من الـ API
  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  // الأقسام (عند التعديل فقط)
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => tenantApi.get('/departments').then((r) => r.data),
    enabled: !!tenantApi && editing,
  });

  // تحديث بيانات الموظف
  const updateMutation = useMutation({
    mutationFn: (data) => tenantApi.put(`/employees/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee', id] });
      qc.invalidateQueries({ queryKey: ['employees'] });
      setEditing(false);
    },
    onError: setError,
  });

  // تحديث دور المستخدم
  const roleMutation = useMutation({
    mutationFn: (role) => tenantApi.put(`/admin/users/${userId}`, { roles: [role] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee-user', userId] });
      qc.invalidateQueries({ queryKey: ['lawyers'] });
      setRoleError(null);
    },
    onError: setRoleError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading) return <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>;
  if (!employee) return null;

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

  const userRoles    = userData?.data?.roles ?? [];
  const currentRole  = getCurrentRoleName(userRoles);
  const activeRole   = selectedRole ?? currentRole;

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/employees">
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
              {employee.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              {!loadingUser && currentRole && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-medium">
                  {currentRole}
                </span>
              )}
            </div>
          </div>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => { setForm({ ...employee }); setEditing(true); }}>
            تعديل
          </Button>
        )}
      </div>

      <ErrorMessage error={error} />

      {/* بيانات الموظف */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {editing ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              updateMutation.mutate({ name: form.name, email: form.email, department_id: form.department_id });
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الاسم" name="name" value={form?.name || ''} onChange={handleChange} />
              <Input label="البريد" name="email" type="email" value={form?.email || ''} onChange={handleChange} dir="ltr" />
            </div>
            <Select label="القسم" name="department_id" value={form?.department_id || ''} onChange={handleChange} options={deptOptions()} />
            <div className="flex gap-3">
              <Button type="submit" loading={updateMutation.isPending}>حفظ التغييرات</Button>
              <Button variant="outline" type="button" onClick={() => setEditing(false)}>إلغاء</Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {[
              { label: 'الاسم', value: employee.name },
              { label: 'البريد الإلكتروني', value: employee.email },
              { label: 'القسم', value: employee.department?.name_ar },
              { label: 'تاريخ التسجيل', value: employee.created_at ? new Date(employee.created_at).toLocaleDateString('ar-SA') : null },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-gray-500 mb-1">{label}</dt>
                <dd className="text-sm font-medium text-gray-900">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* قسم تغيير الدور */}
      {userId && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">دور الموظف في النظام</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              الدور الحالي:{' '}
              <span className="font-medium text-gray-700">
                {loadingUser ? '...' : currentRole}
              </span>
            </p>
          </div>

          <ErrorMessage error={roleError} />

          <div className="flex items-end gap-3">
            <div className="flex-1">
              {loadingRoles ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <Select
                  label="تغيير الدور"
                  name="role"
                  value={activeRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  options={roleOptions()}
                />
              )}
            </div>
            <Button
              type="button"
              loading={roleMutation.isPending}
              disabled={loadingRoles || activeRole === currentRole}
              onClick={() => roleMutation.mutate(activeRole)}
              variant="outline"
            >
              حفظ الدور
            </Button>
          </div>

          {activeRole === 'lawyer' && activeRole !== currentRole && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
              بعد الحفظ سيظهر هذا الموظف في قائمة "اختر محامي" عند إنشاء القضايا
            </p>
          )}

          {roleMutation.isSuccess && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
              ✓ تم تحديث الدور بنجاح
            </p>
          )}
        </div>
      )}
    </div>
  );
}
