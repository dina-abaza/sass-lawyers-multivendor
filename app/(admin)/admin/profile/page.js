'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { centralApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth();

  const [form, setForm]       = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const mutation = useMutation({
    mutationFn: (fd) => centralApi.post('/admin/profile/update', fd),
    onSuccess: (res) => {
      const updated = res.data?.user;
      if (updated) updateUser(updated);
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء الحفظ، يرجى المحاولة مجدداً.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('email', form.email);
    mutation.mutate(fd);
  };

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy-900">الملف الشخصي</h1>
        <p className="text-sm text-slate-500 mt-0.5">تعديل بيانات حساب السوبر ادمن</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#e4e9f2] rounded-2xl p-6 space-y-5">

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-navy-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="border-t border-[#e4e9f2]" />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">الاسم</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            className="h-11 rounded-xl border border-[#e4e9f2] px-3 text-sm outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-500 transition-colors" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
          <input type="email" dir="ltr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
            className="h-11 rounded-xl border border-[#e4e9f2] px-3 text-sm outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-500 transition-colors text-right" />
        </div>

        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            تم حفظ التغييرات بنجاح
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <button type="submit" disabled={mutation.isPending}
          className="w-full py-2.5 rounded-xl bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-60">
          {mutation.isPending ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  );
}
