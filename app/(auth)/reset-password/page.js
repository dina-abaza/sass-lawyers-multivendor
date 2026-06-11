'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { centralApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Spinner from '@/components/common/Spinner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';
  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await centralApi.post('/reset-password', { email, otp, ...form });
      router.push('/login');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">كلمة مرور جديدة</h2>
      <p className="text-sm text-gray-500">اختر كلمة مرور قوية لحسابك.</p>

      <ErrorMessage error={error} />

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
