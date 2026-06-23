'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { missionsApi, employeesApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const MONTHS = [
  { value: '1', label: 'يناير' }, { value: '2', label: 'فبراير' },
  { value: '3', label: 'مارس' },  { value: '4', label: 'أبريل' },
  { value: '5', label: 'مايو' },  { value: '6', label: 'يونيو' },
  { value: '7', label: 'يوليو' }, { value: '8', label: 'أغسطس' },
  { value: '9', label: 'سبتمبر'},{ value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر'},{ value: '12', label: 'ديسمبر' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function MissionsPage() {
  const { tenantApi } = useAuth();

  const [filterType, setFilterType] = useState('all'); // all | date | month
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(String(currentYear));
  const [queryParams, setQueryParams] = useState({});
  const [page, setPage] = useState(1);

  // قائمة الموظفين للـ dropdown
  const { data: empData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });
  const employees = Array.isArray(empData) ? empData : empData?.data ?? [];

  const { data: raw, isLoading } = useQuery({
    queryKey: ['missions', queryParams, page],
    queryFn: () => missionsApi.getAll(tenantApi, { ...queryParams, page }).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const missions = raw?.data?.data ?? raw?.data ?? [];
  const pagination = raw?.data ?? {};
  const total      = pagination.total ?? missions.length;
  const lastPage   = pagination.last_page ?? 1;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (employeeId) params.employee_id = employeeId;
    if (filterType === 'date' && date)   params.date = date;
    if (filterType === 'month' && month) { params.month = month; params.year = year; }
    setQueryParams(params);
    setPage(1);
  };

  const handleReset = () => {
    setEmployeeId('');
    setDate('');
    setMonth('');
    setYear(String(currentYear));
    setFilterType('all');
    setQueryParams({});
    setPage(1);
  };

  const formatDate = (iso) => iso ? iso.split('T')[0] : '—';

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">المأموريات</h1>

      {/* فلاتر البحث */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* فلتر الموظف */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">الموظف</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">الكل</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* نوع الفلتر الزمني */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">الفلترة بالتاريخ</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">بدون فلتر</option>
              <option value="date">تاريخ محدد</option>
              <option value="month">شهر وسنة</option>
            </select>
          </div>

          {/* تاريخ محدد */}
          {filterType === 'date' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* شهر وسنة */}
          {filterType === 'month' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">الشهر</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر الشهر</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">السنة</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            بحث
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            إعادة تعيين
          </button>
        </div>
      </form>

      {/* الجدول */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">قائمة المأموريات</h2>
          {total > 0 && (
            <span className="text-sm text-gray-400">إجمالي: {total}</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : missions.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-sm">لا توجد مأموريات مسجلة</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">#</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الموظف</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الوصف</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">سجلات الحضور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {missions.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{m.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {m.employee?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(m.date)}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs">
                      <p className="truncate">{m.description || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {m.attendances?.length ?? 0} سجل
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="text-sm text-gray-500">صفحة {page} من {lastPage}</span>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
