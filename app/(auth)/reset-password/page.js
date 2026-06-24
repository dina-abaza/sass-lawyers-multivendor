'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { centralApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/common/Spinner';

function resetPasswordErrorMsg(err) {
  if (!err?.response) return 'تعذر الاتصال بالخادم، تحقق من الإنترنت';
  const errors = err.response?.data?.errors;
  if (errors?.password_confirmation) return 'كلمة المرور وتأكيدها غير متطابقتين';
  if (errors?.password) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
  if (err.response.status === 422) return 'رمز التحقق غير صحيح أو منتهي الصلاحية';
  return 'حدث خطأ، يرجى المحاولة مرة أخرى';
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';
  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await centralApi.post('/reset-password', { email, otp, ...form });
      router.push('/login');
    } catch (err) {
      setError(resetPasswordErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">كلمة مرور جديدة</h2>
      <p className="text-sm text-gray-500">اختر كلمة مرور قوية لحسابك.</p>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input label="كلمة المرور الجديدة" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required dir="ltr" />
      <Input label="تأكيد كلمة المرور" name="password_confirmation" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={handleChange} required dir="ltr" />

      <Button type="submit" loading={loading} className="w-full" size="lg">
        حفظ كلمة المرور
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Spinner /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
