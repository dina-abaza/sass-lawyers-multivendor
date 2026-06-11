'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { notificationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function NotificationsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(tenantApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAll(tenantApi),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()}>تحديد الكل كمقروء</Button>
          <Button variant="outline" size="sm" onClick={() => { if (confirm('حذف جميع الإشعارات؟')) deleteAllMutation.mutate(); }}>حذف الكل</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد إشعارات</div>
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <div key={n.id} className={`p-4 rounded-xl border flex items-start gap-3 ${n.read_at ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{n.title || n.data?.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{n.message || n.data?.message}</p>
                <p className="text-xs text-gray-400 mt-1">{n.created_at?.substring(0, 16)}</p>
              </div>
              {!n.read_at && (
                <button onClick={() => markReadMutation.mutate(n.id)}
                  className="text-xs text-blue-600 hover:underline flex-shrink-0">تحديد كمقروء</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
