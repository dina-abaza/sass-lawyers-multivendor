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
      <h2 className="text-xl font-bold text-navy-900 mb-1 tracking-tight">تسجيل الدخول</h2>
      <p className="text-sm text-[#8896a7] mb-4">أدخل بياناتك للوصول إلى النظام</p>

      {error && (
        <div className="rounded-xl bg-[#c0392b]/[0.06] border border-[#c0392b]/20 px-4 py-3 text-sm text-[#c0392b] font-medium flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-2.99L13.74 4a2 2 0 00-3.48 0L3.33 16.01A2 2 0 005.07 19z" />
          </svg>
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
        <Link href="/forgot-password" className="text-sm text-navy-700 font-medium hover:text-gold-600 transition-colors">
          نسيت كلمة المرور؟
        </Link>
      </div>

      <Button type="submit" variant="gold" loading={loading} className="w-full" size="lg">
        دخول
      </Button>

      <p className="text-center text-sm text-[#4a5568]">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="text-navy-700 font-semibold hover:text-gold-600 transition-colors">
          إنشاء حساب جديد
        </Link>
      </p>
    </form>
  );
}
