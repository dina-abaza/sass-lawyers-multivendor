'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { casesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CaseStatusesPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['case-statuses'],
    queryFn: () => casesApi.getStatuses(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const createMutation = useMutation({
    mutationFn: () => casesApi.createStatus(tenantApi, { name }),
    onSuccess: () => { setName(''); qc.invalidateQueries({ queryKey: ['case-statuses'] }); },
    onError: setError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => casesApi.deleteStatus(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['case-statuses'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">حالات القضايا</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">إضافة حالة جديدة</h2>
        <ErrorMessage error={error} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(); }}
          className="flex gap-3">
          <Input placeholder="اسم الحالة" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" loading={createMutation.isPending}>إضافة</Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {list.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-gray-900">{s.name}</span>
              <button onClick={() => { if (confirm('حذف هذه الحالة؟')) deleteMutation.mutate(s.id); }}
                className="text-red-500 hover:text-red-700 text-xs">حذف</button>
            </div>
          ))}
          {list.length === 0 && <p className="px-4 py-6 text-center text-gray-500">لا توجد حالات</p>}
        </div>
      )}
    </div>
  );
}
