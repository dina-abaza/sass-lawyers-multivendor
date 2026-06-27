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

const thCls = 'text-right px-4 py-3.5 font-semibold text-[#4A5568] text-xs uppercase tracking-wide';
const selectCls = 'h-10 rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors';

export default function MissionsPage() {
  const { tenantApi } = useAuth();

  const [filterType, setFilterType] = useState('all');
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(String(currentYear));
  const [queryParams, setQueryParams] = useState({});
  const [page, setPage] = useState(1);

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

  const missions  = raw?.data?.data ?? raw?.data ?? [];
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
    setEmployeeId(''); setDate(''); setMonth('');
    setYear(String(currentYear)); setFilterType('all');
    setQueryParams({}); setPage(1);
  };

  const formatDate = (iso) => iso ? iso.split('T')[0] : '—';

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الموارد البشرية</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>المأموريات</h1>
            {total > 0 && <p className="text-white/50 text-sm mt-0.5">إجمالي: {total}</p>}
          </div>
        </div>
      </div>

      {/* فلاتر البحث */}
      <form onSubmit={handleSearch}
        className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)] space-y-4">
        <h2 className="font-semibold text-[#0A1628] text-sm flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          فلاتر البحث
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#4A5568]">الموظف</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={selectCls}>
              <option value="">الكل</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#4A5568]">الفلترة بالتاريخ</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectCls}>
              <option value="all">بدون فلتر</option>
              <option value="date">تاريخ محدد</option>
              <option value="month">شهر وسنة</option>
            </select>
          </div>
          {filterType === 'date' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#4A5568]">التاريخ</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={selectCls} />
            </div>
          )}
          {filterType === 'month' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#4A5568]">الشهر</label>
                <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls}>
                  <option value="">اختر الشهر</option>
                  {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#4A5568]">السنة</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            بحث
          </button>
          <button type="button" onClick={handleReset}
            className="px-5 py-2 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
            إعادة تعيين
          </button>
        </div>
      </form>

      {/* الجدول */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
      ) : missions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <p className="text-[#8896A7] text-sm">لا توجد مأموريات مسجلة</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
                <tr>
                  <th className={thCls}>#</th>
                  <th className={thCls}>الموظف</th>
                  <th className={thCls}>التاريخ</th>
                  <th className={thCls}>الوصف</th>
                  <th className={thCls}>سجلات الحضور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {missions.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-4 py-3.5 text-[#8896A7] font-mono text-xs">{m.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#0A1628]">{m.employee?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-[#4A5568]">{formatDate(m.date)}</td>
                    <td className="px-4 py-3.5 text-[#4A5568] max-w-xs truncate">{m.description || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-[#EBF0FA] text-[#081A3A] text-xs px-2.5 py-0.5 rounded-full font-semibold">
                        {m.attendances?.length ?? 0} سجل
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#E2E6F0]">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-1.5 text-sm rounded-xl border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                السابق
              </button>
              <span className="text-sm text-[#8896A7]">صفحة {page} من {lastPage}</span>
              <button onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                className="px-4 py-1.5 text-sm rounded-xl border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                التالي
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
