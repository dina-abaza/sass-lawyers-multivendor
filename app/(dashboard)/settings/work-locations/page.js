'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { workLocationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/common/ErrorMessage';

const EMPTY_FORM = { name: '', latitude: '', longitude: '', radius: 150 };

function parseFormPayload(form) {
  return {
    name: form.name,
    latitude: parseFloat(form.latitude),
    longitude: parseFloat(form.longitude),
    radius: parseInt(form.radius, 10),
  };
}

export default function WorkLocationsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['work-locations'],
    queryFn: () => workLocationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const createMutation = useMutation({
    mutationFn: () => workLocationsApi.create(tenantApi, parseFormPayload(form)),
    onSuccess: () => { setForm(EMPTY_FORM); qc.invalidateQueries({ queryKey: ['work-locations'] }); },
    onError: setError,
  });

  const updateMutation = useMutation({
    mutationFn: () => workLocationsApi.update(tenantApi, editingId, parseFormPayload(form)),
    onSuccess: () => { setForm(EMPTY_FORM); setEditingId(null); qc.invalidateQueries({ queryKey: ['work-locations'] }); },
    onError: setError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => workLocationsApi.delete(tenantApi, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-locations'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleEdit = (loc) => {
    setEditingId(loc.id);
    setForm({ name: loc.name, latitude: loc.latitude, longitude: loc.longitude, radius: loc.radius });
    setError(null);
  };

  const handleCancel = () => { setForm(EMPTY_FORM); setEditingId(null); setError(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (editingId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">مواقع العمل</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">
          {editingId ? 'تعديل الموقع' : 'إضافة موقع جديد'}
        </h2>
        <ErrorMessage error={error} />
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input placeholder="الاسم" name="name" value={form.name} onChange={handleChange} required />
          <Input placeholder="خط العرض" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} required />
          <Input placeholder="خط الطول" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} required />
          <div className="flex gap-2">
            <Input placeholder="النطاق (م)" name="radius" type="number" value={form.radius} onChange={handleChange} />
            <Button type="submit" loading={isPending}>{editingId ? 'حفظ' : 'إضافة'}</Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={handleCancel}>إلغاء</Button>
            )}
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((loc) => (
            <div key={loc.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <p className="font-semibold text-gray-900">{loc.name}</p>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(loc)} className="text-blue-500 hover:text-blue-700 text-xs">تعديل</button>
                  <button onClick={() => { if (confirm('حذف؟')) deleteMutation.mutate(loc.id); }}
                    className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">النطاق: {loc.radius} متر</p>
              <p className="text-xs text-gray-400">{loc.latitude}, {loc.longitude}</p>
            </div>
          ))}
          {list.length === 0 && <p className="col-span-3 text-center text-gray-500 py-8">لا توجد مواقع</p>}
        </div>
      )}
    </div>
  );
}
