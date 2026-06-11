'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { centralApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    tenant_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await centralApi.post('/register', form);
      setSuccess(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">تم استلام طلبك بنجاح</h2>
        <p className="text-gray-600 text-sm">في انتظار موافقة الإدارة لتفعيل مكتبك.</p>
        <Link href="/login">
          <Button className="w-full mt-2">العودة لتسجيل الدخول</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">إنشاء حساب جديد</h2>
      <p className="text-sm text-gray-500">سجّل مكتب محاماتك</p>

      <ErrorMessage error={error} />

      <Input label="الاسم الكامل" name="name" placeholder="أحمد محمد" value={form.name} onChange={handleChange} required />
      <Input label="البريد الإلكتروني" name="email" type="email" placeholder="example@domain.com" value={form.email} onChange={handleChange} required dir="ltr" />
      <Input label="اسم المكتب (المعرّف)" name="tenant_name" placeholder="my-office (إنجليزي بدون مسافات)" value={form.tenant_name} onChange={handleChange} required dir="ltr" />
      <Input label="كلمة المرور" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required dir="ltr" />
      <Input label="تأكيد كلمة المرور" name="password_confirmation" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={handleChange} required dir="ltr" />

      <Button type="submit" loading={loading} className="w-full" size="lg">
        إنشاء الحساب
      </Button>

      <p className="text-center text-sm text-gray-600">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
