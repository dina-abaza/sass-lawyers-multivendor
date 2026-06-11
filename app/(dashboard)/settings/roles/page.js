'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { rolesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function RolesPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => rolesApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الأدوار والصلاحيات</h1>
        <Link href="/settings/roles/create"><Button>+ دور جديد</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد أدوار مسجلة</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((role) => (
            <div key={role.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="font-semibold text-gray-900">{role.name}</p>
                <button onClick={() => { if (confirm('حذف هذا الدور؟')) deleteMutation.mutate(role.id); }}
                  className="text-red-500 hover:text-red-700 text-xs">حذف</button>
              </div>
              {role.permissions?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 5).map((p, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{p.name || p}</span>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="text-xs text-gray-500">+{role.permissions.length - 5}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
