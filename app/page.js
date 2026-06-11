'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.replace('/login'); return; }
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const source = user?.all_roles?.length ? user.all_roles : (user?.roles || []);
      const roles = source.map((r) => (typeof r === 'string' ? r : r?.name)).filter(Boolean);
      router.replace(roles.includes('super_admin') ? '/admin/dashboard' : '/dashboard');
    } catch {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
