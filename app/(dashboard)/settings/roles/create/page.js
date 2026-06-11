'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { rolesApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateRolePage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);

  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesApi.getPermissions(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: () => rolesApi.create(tenantApi, { name, permissions: selected }),
    onSuccess: () => router.push('/settings/roles'),
    onError: setError,
  });

  const permissions = Array.isArray(permissionsData) ? permissionsData : permissionsData?.data ?? [];

  function toggle(perm) {
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings/roles"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">دور جديد</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <ErrorMessage error={error} />

        <Input label="اسم الدور" value={name} onChange={(e) => setName(e.target.value)} required placeholder="مثال: general_manager" dir="ltr" />

        {permissions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">الصلاحيات</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {permissions.map((p) => {
                const key = p.name || p;
                return (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={selected.includes(key)} onChange={() => toggle(key)} />
                    <span className="text-xs text-gray-700">{key}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ الدور</Button>
          <Link href="/settings/roles"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
