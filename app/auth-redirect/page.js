'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Spinner from '@/components/common/Spinner';

function AuthRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (!token || !userParam) {
      window.location.replace('/login');
      return;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem('auth_token', decodeURIComponent(token));
      localStorage.setItem('auth_user', JSON.stringify(userData));
      window.location.replace('/dashboard');
    } catch {
      window.location.replace('/login');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]">
      <Spinner size="lg" />
    </div>
  );
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]">
        <Spinner size="lg" />
      </div>
    }>
      <AuthRedirect />
    </Suspense>
  );
}
