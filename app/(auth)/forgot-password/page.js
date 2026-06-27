'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { centralApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await centralApi.post('/forgot-password', { email });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">استعادة كلمة المرور</h2>
      <p className="text-sm text-gray-500">أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق.</p>

      <ErrorMessage error={error} />

      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="example@domain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        dir="ltr"
      />

      <Button type="submit" variant="gold" loading={loading} className="w-full" size="lg">
        إرسال الرمز
      </Button>

      <p className="text-center text-sm">
        <Link href="/login" className="text-navy-700 hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
