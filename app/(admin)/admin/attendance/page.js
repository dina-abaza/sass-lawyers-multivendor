'use client';

import { useQuery } from '@tanstack/react-query';
import { centralApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

export default function AdminAttendancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-attendance'],
    queryFn: () => centralApi.get('/admin/attendance').then((r) => r.data),
    retry: false,
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">سجل الحضور والانصراف</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">لا توجد سجلات حضور</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الموظف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">وقت الحضور</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">وقت الانصراف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">مهمة خارجية</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{a.user?.name || a.user_id}</td>
                  <td className="px-4 py-3 text-green-700">{a.check_in_time}</td>
                  <td className="px-4 py-3 text-red-700">{a.check_out_time || '—'}</td>
                  <td className="px-4 py-3">{a.is_on_mission ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{a.date || a.created_at?.substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
