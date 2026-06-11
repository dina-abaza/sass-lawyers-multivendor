'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Spinner from '@/components/common/Spinner';

export default function AdminLayout({ children }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!isSuperAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, isSuperAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">{children}</div>
    </div>
  );
}
