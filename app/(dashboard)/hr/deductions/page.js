'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { deductionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function DeductionsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [newType, setNewType] = useState({ name: '', value: '' });
  const [error, setError] = useState(null);

  const { data: types, isLoading } = useQuery({
    queryKey: ['deduction-types'],
    queryFn: () => deductionsApi.getTypes(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const createMutation = useMutation({
    mutationFn: () => deductionsApi.createType(tenantApi, newType),
    onSuccess: () => { setNewType({ name: '', value: '' }); qc.invalidateQueries({ queryKey: ['deduction-types'] }); },
    onError: setError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deductionsApi.deleteType(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deduction-types'] }),
  });

  const list = Array.isArray(types) ? types : types?.data ?? [];

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">أنواع الخصومات</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">إضافة نوع خصم جديد</h2>
        <ErrorMessage error={error} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); createMutation.mutate(); }}
          className="flex gap-3">
          <Input placeholder="اسم الخصم" value={newType.name} onChange={(e) => setNewType((f) => ({ ...f, name: e.target.value }))} required />
          <Input placeholder="القيمة" type="number" value={newType.value} onChange={(e) => setNewType((f) => ({ ...f, value: e.target.value }))} required className="w-28" />
          <Button type="submit" loading={createMutation.isPending}>إضافة</Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {list.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-gray-900">{t.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">{t.value} ر.س</span>
                <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(t.id); }}
                  className="text-red-500 hover:text-red-700 text-xs">حذف</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="px-4 py-6 text-center text-gray-500">لا توجد أنواع خصومات</p>}
        </div>
      )}
    </div>
  );
}
