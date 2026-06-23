'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Workflow from '@/components/landing/Workflow';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import Contact from '@/components/landing/Contact';
import CTAFooter from '@/components/landing/CTAFooter';

export default function Home() {
  const router = useRouter();
  // أثناء فحص حالة تسجيل الدخول لا نعرض شيئاً لتجنّب "وميض" الصفحة الرئيسية
  // قبل تحويل المستخدم المسجّل بالفعل إلى لوحة تحكمه.
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setChecking(false);
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const source = user?.all_roles?.length ? user.all_roles : (user?.roles || []);
      const roles = source.map((r) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);
      router.replace(roles.includes('super_admin') ? '/admin/dashboard' : '/dashboard');
    } catch {
      router.replace('/dashboard');
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <Pricing />
      <FAQ />
      <Contact />
      <CTAFooter />
    </div>
  );
}
