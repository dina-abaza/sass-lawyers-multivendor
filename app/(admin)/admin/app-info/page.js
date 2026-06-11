'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appInfoApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

export default function AdminAppInfoPage() {
  const { tenantApi } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', about: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['app-info'],
    queryFn: () => appInfoApi.get(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  useEffect(() => {
    const d = data?.data || data;
    if (d) {
      setForm({
        name: d.name || '',
        phone: d.phone || '',
        email: d.email || '',
        address: d.address || '',
        about: d.about || '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (d) => appInfoApi.update(tenantApi, d),
    onSuccess: () => { setSuccess('تم الحفظ بنجاح'); setError(''); },
    onError: (err) => { setError(err.response?.data?.message || 'حدث خطأ'); setSuccess(''); },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">معلومات التطبيق</h1>
        <p className="text-sm text-gray-500 mt-1">إعدادات النظام والمعلومات العامة</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="space-y-5">
          {[
            { key: 'name', label: 'اسم النظام', type: 'text', placeholder: 'نظام المحاماة' },
            { key: 'phone', label: 'رقم الهاتف', type: 'tel', placeholder: '+966 5x xxx xxxx' },
            { key: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'info@example.com' },
            { key: 'address', label: 'العنوان', type: 'text', placeholder: 'الرياض، المملكة العربية السعودية' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نبذة عن النظام</label>
            <textarea
              value={form.about}
              onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => updateMutation.mutate(form)} loading={updateMutation.isPending}>
            حفظ التغييرات
          </Button>
        </div>
      </div>
    </div>
  );
}
