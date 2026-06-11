'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { attendanceApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

export default function AttendancePage() {
  const { tenantApi } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => attendanceApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">سجل الحضور والانصراف</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا توجد سجلات حضور</div>
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
