'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function loginErrorMsg(err) {
  if (!err?.response) return 'تعذر الاتصال بالخادم، تحقق من الإنترنت';
  if (err.response.status === 401) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  if (err.response.status === 403) return 'الحساب موقوف، تواصل مع الإدارة';
  if (err.response.status === 429) return 'محاولات كثيرة، انتظر قليلاً ثم حاول مرة أخرى';
  return 'حدث خطأ، يرجى المحاولة مرة أخرى';
}

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(loginErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900 mb-1">تسجيل الدخول</h2>
      <p className="text-sm text-gray-500 mb-4">أدخل بياناتك للوصول إلى النظام</p>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        label="البريد الإلكتروني"
        name="email"
        type="email"
        placeholder="example@domain.com"
        value={form.email}
        onChange={handleChange}
        required
        dir="ltr"
      />
      <Input
        label="كلمة المرور"
        name="password"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={handleChange}
        required
        dir="ltr"
      />

      <div className="text-left">
        <Link href="/forgot-password" className="text-sm text-navy-700 hover:underline">
          نسيت كلمة المرور؟
        </Link>
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        دخول
      </Button>

      <p className="text-center text-sm text-gray-600">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="text-navy-700 font-medium hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>
    </form>
  );
}
