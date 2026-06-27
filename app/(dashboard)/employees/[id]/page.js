'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { rolesApi, employeesApi, departmentsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ErrorMessage from '@/components/common/ErrorMessage';

const EXCLUDED_ROLES = ['super_admin', 'owner'];

function getCurrentRoleName(userRoles = []) {
  const names = userRoles.map((r) => (typeof r === 'string' ? r : r.name));
  return names.find((n) => !EXCLUDED_ROLES.includes(n)) ?? names[0] ?? 'user';
}

const fieldCls = 'w-full border border-[#E2E6F0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] bg-white transition-colors text-[#0A1628]';

export default function EmployeeDetailPage({ params }) {
  const { id } = use(params);
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [roleError, setRoleError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const userId = employee?.user_id;

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['employee-user', userId],
    queryFn: () => tenantApi.get(`/admin/users/${userId}`).then((r) => r.data),
    enabled: !!tenantApi && !!userId,
    onSuccess: (d) => {
      const roles = d?.data?.roles ?? [];
      if (selectedRole === null) setSelectedRole(getCurrentRoleName(roles));
    },
  });

  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: () => rolesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: departments } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS],
    queryFn: () => departmentsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi && editing,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => employeesApi.update(tenantApi, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee', id] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES] });
      setEditing(false);
    },
    onError: setError,
  });

  const roleMutation = useMutation({
    mutationFn: (role) => tenantApi.put(`/admin/users/${userId}`, { roles: [role] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee-user', userId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.LAWYERS] });
      setRoleError(null);
    },
    onError: setRoleError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  if (!employee) return null;

  function deptOptions() {
    const list = Array.isArray(departments) ? departments : departments?.data ?? [];
    return list.map((d) => ({ value: d.id, label: d.name_ar || d.name_en || d.name }));
  }

  function roleOptions() {
    const list = rolesData?.data ?? [];
    return list.filter((r) => !EXCLUDED_ROLES.includes(r.name)).map((r) => ({ value: r.name, label: r.name }));
  }

  const userRoles   = userData?.data?.roles ?? [];
  const currentRole = getCurrentRoleName(userRoles);
  const activeRole  = selectedRole ?? currentRole;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
              {employee.name?.charAt(0)}
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الموظفون</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>{employee.name}</h1>
              {!loadingUser && currentRole && (
                <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>
                  {currentRole}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/employees"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </Link>
            {!editing && (
              <button onClick={() => { setForm({ ...employee }); setEditing(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                تعديل
              </button>
            )}
          </div>
        </div>
      </div>

      <ErrorMessage error={error} />

      {/* بيانات الموظف */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-5 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          {editing ? 'تعديل البيانات' : 'بيانات الموظف'}
        </h2>

        {editing ? (
          <form className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              updateMutation.mutate({ name: form.name, email: form.email, department_id: form.department_id });
            }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الاسم" name="name" value={form?.name || ''} onChange={handleChange} />
              <Input label="البريد" name="email" type="email" value={form?.email || ''} onChange={handleChange} dir="ltr" />
            </div>
            <Select label="القسم" name="department_id" value={form?.department_id || ''} onChange={handleChange} options={deptOptions()} />
            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={updateMutation.isPending}>حفظ التغييرات</Button>
              <Button variant="outline" type="button" onClick={() => setEditing(false)}>إلغاء</Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {[
              { label: 'الاسم',              value: employee.name },
              { label: 'البريد الإلكتروني', value: employee.email },
              { label: 'القسم',              value: employee.department?.name_ar },
              { label: 'تاريخ التسجيل',     value: employee.created_at ? new Date(employee.created_at).toLocaleDateString('ar-SA') : null },
            ].map(({ label, value }) => (
              <div key={label} className="border-b border-[#F0F2F7] pb-4 last:border-0 last:pb-0">
                <dt className="text-xs text-[#8896A7] mb-1.5 font-medium">{label}</dt>
                <dd className="text-sm font-semibold text-[#0A1628]">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* قسم تغيير الدور */}
      {userId && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <h2 className="font-semibold text-[#0A1628] mb-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
            دور الموظف في النظام
          </h2>
          <p className="text-xs text-[#8896A7] mb-4">
            الدور الحالي:{' '}
            <span className="font-semibold text-[#4A5568]">{loadingUser ? '...' : currentRole}</span>
          </p>

          <ErrorMessage error={roleError} />

          <div className="flex items-end gap-3">
            <div className="flex-1">
              {loadingRoles ? (
                <div className="h-10 bg-[#F8F9FC] rounded-xl animate-pulse" />
              ) : (
                <Select label="تغيير الدور" name="role" value={activeRole}
                  onChange={(e) => setSelectedRole(e.target.value)} options={roleOptions()} />
              )}
            </div>
            <Button type="button" loading={roleMutation.isPending}
              disabled={loadingRoles || activeRole === currentRole}
              onClick={() => roleMutation.mutate(activeRole)} variant="outline">
              حفظ الدور
            </Button>
          </div>

          {activeRole === 'lawyer' && activeRole !== currentRole && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mt-3">
              بعد الحفظ سيظهر هذا الموظف في قائمة "اختر محامي" عند إنشاء القضايا
            </p>
          )}
          {roleMutation.isSuccess && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mt-3">
              ✓ تم تحديث الدور بنجاح
            </p>
          )}
        </div>
      )}
    </div>
  );
}
