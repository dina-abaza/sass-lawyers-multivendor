'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { departmentsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function DepartmentsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => departmentsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الأقسام</h1>
        <Link href="/departments/create"><Button>+ قسم جديد</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد أقسام مسجلة</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{d.name_ar}</p>
                {d.name_en && <p className="text-sm text-gray-500">{d.name_en}</p>}
              </div>
              <button onClick={() => { if (confirm('حذف هذا القسم؟')) deleteMutation.mutate(d.id); }}
                className="text-red-500 hover:text-red-700 text-xs">حذف</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
