'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { attendanceApi, workLocationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

/* ── helpers ─────────────────────────────────────────────── */
function fmt(dt, mode = 'time') {
  if (!dt) return '—';
  const d = new Date(dt);
  if (mode === 'date') return d.toLocaleDateString('ar-SA');
  return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function isToday(dt) {
  if (!dt) return false;
  const d = new Date(dt), now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

/* ── GPS hook ────────────────────────────────────────────── */
function useGPS() {
  const [state, setState] = useState({ status: 'idle', coords: null, error: null });
  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', coords: null, error: 'المتصفح لا يدعم تحديد الموقع' });
      return;
    }
    setState({ status: 'loading', coords: null, error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ status: 'success', coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, error: null }),
      () => setState({ status: 'error', coords: null, error: 'تعذّر الحصول على الموقع — تأكد من منح الإذن' }),
      { timeout: 10000 }
    );
  }, []);
  return { ...state, detect };
}

const selectCls = 'h-11 w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors';
const thCls     = 'text-right px-4 py-3.5 font-semibold text-[#4A5568] text-xs uppercase tracking-wide';

/* ── Check-in / Check-out card ───────────────────────────── */
function AttendanceCard({ list, tenantApi, userId }) {
  const qc  = useQueryClient();
  const gps = useGPS();
  const [locationId, setLocationId]   = useState('');
  const [isMission, setIsMission]     = useState(false);
  const [missionDesc, setMissionDesc] = useState('');
  const [apiError, setApiError]       = useState(null);
  const [successMsg, setSuccessMsg]   = useState(null);

  const { data: locData } = useQuery({
    queryKey: ['work-locations'],
    queryFn: () => workLocationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });
  const locations = Array.isArray(locData) ? locData : locData?.data ?? [];

  const todayRecord = list.find((a) => a.user_id === userId && isToday(a.check_in));
  const checkedIn   = !!todayRecord;
  const checkedOut  = !!todayRecord?.check_out;

  const checkInMutation = useMutation({
    mutationFn: (payload) => attendanceApi.checkIn(tenantApi, payload),
    onSuccess: (res) => { setSuccessMsg(res.data?.message || 'تم تسجيل الحضور بنجاح'); setApiError(null); qc.invalidateQueries({ queryKey: ['attendance'] }); },
    onError: (err) => setApiError(err.response?.data?.message || 'حدث خطأ'),
  });

  const checkOutMutation = useMutation({
    mutationFn: (payload) => attendanceApi.checkOut(tenantApi, payload),
    onSuccess: (res) => { setSuccessMsg(res.data?.message || 'تم تسجيل الانصراف بنجاح'); setApiError(null); qc.invalidateQueries({ queryKey: ['attendance'] }); },
    onError: (err) => setApiError(err.response?.data?.message || 'حدث خطأ'),
  });

  function handleSubmit(type) {
    setApiError(null); setSuccessMsg(null);
    if (!gps.coords)  { setApiError('يجب تحديد موقعك الجغرافي أولاً'); return; }
    if (!locationId)  { setApiError('يجب اختيار موقع العمل'); return; }
    if (isMission && !missionDesc.trim()) { setApiError('يجب إدخال وصف المأمورية'); return; }
    const payload = {
      latitude: gps.coords.latitude, longitude: gps.coords.longitude,
      work_location_id: locationId,
      ...(isMission && { is_on_mission: true, mission_description: missionDesc }),
    };
    type === 'in' ? checkInMutation.mutate(payload) : checkOutMutation.mutate(payload);
  }

  const isPending = checkInMutation.isPending || checkOutMutation.isPending;

  if (checkedIn && checkedOut) {
    return (
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-emerald-800">تم تسجيل الحضور والانصراف اليوم</p>
          <p className="text-sm text-emerald-600 mt-0.5">
            حضور {fmt(todayRecord.check_in)} — انصراف {fmt(todayRecord.check_out)}
          </p>
        </div>
      </div>
    );
  }

  const action = checkedIn ? 'out' : 'in';

  return (
    <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)] space-y-4">
      <h2 className="font-semibold text-[#0A1628] flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
        تسجيل الحضور / الانصراف
      </h2>

      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full ${checkedIn ? 'bg-emerald-500' : 'bg-[#E2E6F0]'}`} />
        <span className="text-sm text-[#4A5568]">
          {checkedIn ? `حاضر منذ ${fmt(todayRecord.check_in)}` : 'لم يتم تسجيل الحضور اليوم'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={gps.detect} disabled={gps.status === 'loading'}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 ${
            gps.status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC]'
          }`}>
          {gps.status === 'loading'
            ? <span className="w-4 h-4 border-2 border-[#E2E6F0] border-t-[#081A3A] rounded-full animate-spin" />
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
          {gps.status === 'success' ? 'تم تحديد الموقع ✓' : 'تحديد الموقع تلقائياً'}
        </button>
        {gps.status === 'success' && (
          <span className="text-xs text-[#8896A7] font-mono">{gps.coords.latitude.toFixed(4)}, {gps.coords.longitude.toFixed(4)}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#4A5568]">موقع العمل</label>
        <select value={locationId} onChange={e => setLocationId(e.target.value)} className={selectCls}>
          <option value="">اختر موقع العمل</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div onClick={() => setIsMission(v => !v)}
          className="w-10 h-6 rounded-full transition-colors relative flex-shrink-0"
          style={{ background: isMission ? '#081A3A' : '#E2E6F0' }}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isMission ? 'right-1' : 'right-5'}`} />
        </div>
        <span className="text-sm text-[#4A5568]">مأمورية خارجية</span>
      </label>

      {isMission && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#4A5568]">وصف المأمورية</label>
          <textarea rows={2} value={missionDesc} onChange={e => setMissionDesc(e.target.value)}
            placeholder="مثال: زيارة عميل في المحكمة التجارية"
            className="w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors resize-none" />
        </div>
      )}

      {apiError   && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{apiError}</div>}
      {successMsg && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{successMsg}</div>}
      {gps.error  && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">{gps.error}</div>}

      <button onClick={() => handleSubmit(action)} disabled={isPending}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        style={action === 'out'
          ? { background: '#DC2626', color: '#ffffff' }
          : { background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff', boxShadow: '0 4px 12px rgba(8,26,58,0.25)' }}>
        {isPending
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : action === 'in' ? 'تسجيل الحضور' : 'تسجيل الانصراف'}
      </button>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function AttendancePage() {
  const { tenantApi, user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => attendanceApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الموارد البشرية</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>الحضور والانصراف</h1>
            <p className="text-white/50 text-sm mt-0.5">جميع الموظفين</p>
          </div>
        </div>
      </div>

      {/* بطاقة تسجيل الحضور */}
      {!isLoading && <AttendanceCard list={list} tenantApi={tenantApi} userId={user?.id} />}

      {/* جدول السجلات */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#0A1628]">سجل الحضور</h2>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E6F0] py-12 text-center text-sm text-[#8896A7]">
            لا توجد سجلات حضور بعد
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: '#F0F4FA' }} className="border-b border-[#E2E6F0]">
                  <tr>
                    {['الموظف','التاريخ','الحضور','الانصراف','النطاق','مأمورية','خصم','ملاحظات'].map(h => (
                      <th key={h} className={thCls}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F7]">
                  {list.map(a => (
                    <tr key={a.id} className="hover:bg-[#F8F9FC] transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-[#0A1628]">{a.employee?.name || '—'}</td>
                      <td className="px-4 py-3.5 text-[#4A5568]">{fmt(a.check_in, 'date')}</td>
                      <td className="px-4 py-3.5 text-emerald-700 font-medium">{fmt(a.check_in)}</td>
                      <td className="px-4 py-3.5 text-red-600 font-medium">{fmt(a.check_out)}</td>
                      <td className="px-4 py-3.5">
                        {a.is_outside_range
                          ? <span className="px-2.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-semibold">خارج النطاق</span>
                          : <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 font-semibold">داخل النطاق</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {a.mission_id
                          ? <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#EBF0FA] text-[#081A3A] font-semibold">مأمورية</span>
                          : <span className="text-[#E2E6F0]">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {a.deduction_sheet
                          ? <span className="px-2.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-semibold">{a.deduction_sheet.amount} ريال</span>
                          : <span className="text-[#E2E6F0]">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-[#8896A7] max-w-xs truncate">{a.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
