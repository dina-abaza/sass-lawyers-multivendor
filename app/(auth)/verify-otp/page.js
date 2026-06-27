'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { centralApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/common/Spinner';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await centralApi.post('/verify-otp', { email, otp });
      router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
    } catch (err) {
      if (!err?.response) {
        setError('تعذر الاتصال بالخادم، تحقق من الإنترنت');
      } else {
        setError('رمز التحقق غير صحيح أو منتهي الصلاحية');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">التحقق من الرمز</h2>
      <p className="text-sm text-gray-500">
        أدخل الرمز المرسل إلى{' '}
        <span className="font-medium text-gray-800">{email}</span>
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        label="رمز التحقق"
        type="text"
        inputMode="numeric"
        maxLength={4}
        placeholder="0000"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
        dir="ltr"
      />

      <Button type="submit" variant="gold" loading={loading} className="w-full" size="lg">
        تأكيد الرمز
      </Button>
    </form>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Spinner /></div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
