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
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الإعدادات</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>مواقع العمل</h1>
            <p className="text-white/50 text-sm mt-0.5">إدارة مواقع العمل ونطاقات الحضور</p>
          </div>
        </div>
      </div>

      {/* الفورم */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
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

      {/* القائمة */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Spinner /></div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] py-12 text-center shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FC] border border-[#E2E6F0] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#8896A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-[#8896A7]">لا توجد مواقع عمل بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((loc) => (
            <div key={loc.id}
              className="bg-white rounded-2xl border border-[#E2E6F0] p-4 shadow-[0_2px_8px_rgba(8,26,58,0.05)] hover:shadow-[0_4px_16px_rgba(8,26,58,0.10)] transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF0FA] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#081A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-[#0A1628] text-sm">{loc.name}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(loc)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#EBF0FA] text-[#081A3A] hover:bg-[#081A3A]/15 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => { if (confirm('حذف هذا الموقع؟')) deleteMutation.mutate(loc.id); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-1 border-t border-[#F0F2F7] pt-3">
                <p className="text-xs text-[#8896A7]">النطاق: <span className="font-semibold text-[#4A5568]">{loc.radius} متر</span></p>
                <p className="text-xs text-[#8896A7] font-mono">{loc.latitude}, {loc.longitude}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
