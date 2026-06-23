'use client';

import { useAuth } from '@/context/AuthContext';

export default function PermissionGate({ permission, children }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">غير مصرح بالوصول</h2>
        <p className="text-gray-500 text-sm max-w-sm">ليس لديك صلاحية لعرض هذه الصفحة. تواصل مع مدير المكتب لمنحك الصلاحية المطلوبة.</p>
      </div>
    );
  }

  return children;
}
