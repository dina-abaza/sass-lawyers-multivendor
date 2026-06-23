'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { attendanceApi, workLocationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

/* ── helpers ─────────────────────────────────────────────── */
function fmt(dt, mode = 'time') {
  if (!dt) return '—';
  const d = new Date(dt);
  if (mode === 'date') return d.toLocaleDateString('ar-SA');
  return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function isToday(dt) {
  if (!dt) return false;
  const d = new Date(dt);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
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
      (pos) => setState({
        status: 'success',
        coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        error: null,
      }),
      () => setState({ status: 'error', coords: null, error: 'تعذّر الحصول على الموقع — تأكد من منح الإذن' }),
      { timeout: 10000 }
    );
  }, []);

  return { ...state, detect };
}

/* ── Check-in / Check-out card ───────────────────────────── */
function AttendanceCard({ list, tenantApi, userId }) {
  const qc = useQueryClient();
  const gps = useGPS();

  const [locationId, setLocationId] = useState('');
  const [isMission, setIsMission] = useState(false);
  const [missionDesc, setMissionDesc] = useState('');
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { data: locData } = useQuery({
    queryKey: ['work-locations'],
    queryFn: () => workLocationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });
  const locations = Array.isArray(locData) ? locData : locData?.data ?? [];

  // اكتشف حالة اليوم بناءً على user_id
  const todayRecord = list.find((a) => a.user_id === userId && isToday(a.check_in));
  const checkedIn  = !!todayRecord;
  const checkedOut = !!todayRecord?.check_out;

  const checkInMutation = useMutation({
    mutationFn: (payload) => attendanceApi.checkIn(tenantApi, payload),
    onSuccess: (res) => {
      setSuccessMsg(res.data?.message || 'تم تسجيل الحضور بنجاح');
      setApiError(null);
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err) => setApiError(err.response?.data?.message || 'حدث خطأ'),
  });

  const checkOutMutation = useMutation({
    mutationFn: (payload) => attendanceApi.checkOut(tenantApi, payload),
    onSuccess: (res) => {
      setSuccessMsg(res.data?.message || 'تم تسجيل الانصراف بنجاح');
      setApiError(null);
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err) => setApiError(err.response?.data?.message || 'حدث خطأ'),
  });

  function handleSubmit(type) {
    setApiError(null);
    setSuccessMsg(null);
    if (!gps.coords) { setApiError('يجب تحديد موقعك الجغرافي أولاً'); return; }
    if (!locationId)  { setApiError('يجب اختيار موقع العمل'); return; }
    if (isMission && !missionDesc.trim()) { setApiError('يجب إدخال وصف المأمورية'); return; }

    const payload = {
      latitude: gps.coords.latitude,
      longitude: gps.coords.longitude,
      work_location_id: locationId,
      ...(isMission && { is_on_mission: true, mission_description: missionDesc }),
    };

    type === 'in' ? checkInMutation.mutate(payload) : checkOutMutation.mutate(payload);
  }

  const isPending = checkInMutation.isPending || checkOutMutation.isPending;

  /* حالة: انتهى اليوم */
  if (checkedIn && checkedOut) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-emerald-800">تم تسجيل الحضور والانصراف اليوم</p>
          <p className="text-sm text-emerald-600 mt-0.5">حضور {fmt(todayRecord.check_in)} — انصراف {fmt(todayRecord.check_out)}</p>
        </div>
      </div>
    );
  }

  const action = checkedIn ? 'out' : 'in';

  return (
    <div className="bg-white border border-[#e4e9f2] rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full ${checkedIn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        <span className="text-sm font-medium text-slate-700">
          {checkedIn ? `حاضر منذ ${fmt(todayRecord.check_in)}` : 'لم يتم تسجيل الحضور اليوم'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={gps.detect} disabled={gps.status === 'loading'}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            gps.status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#e4e9f2] text-slate-600 hover:bg-navy-50 hover:border-navy-200'
          } disabled:opacity-50`}>
          {gps.status === 'loading'
            ? <span className="w-4 h-4 border-2 border-slate-300 border-t-navy-600 rounded-full animate-spin" />
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
          {gps.status === 'success' ? 'تم تحديد الموقع ✓' : 'تحديد الموقع تلقائياً'}
        </button>
        {gps.status === 'success' && (
          <span className="text-xs text-slate-400 font-mono">{gps.coords.latitude.toFixed(4)}, {gps.coords.longitude.toFixed(4)}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">موقع العمل</label>
        <select value={locationId} onChange={e => setLocationId(e.target.value)}
          className="h-11 rounded-xl border border-[#e4e9f2] px-3 text-sm outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-500 bg-white">
          <option value="">اختر موقع العمل</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div onClick={() => setIsMission(v => !v)}
          className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${isMission ? 'bg-navy-700' : 'bg-gray-200'}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isMission ? 'right-1' : 'right-5'}`} />
        </div>
        <span className="text-sm text-slate-700">مأمورية خارجية</span>
      </label>

      {isMission && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">وصف المأمورية</label>
          <textarea rows={2} value={missionDesc} onChange={e => setMissionDesc(e.target.value)}
            placeholder="مثال: زيارة عميل في المحكمة التجارية"
            className="rounded-xl border border-[#e4e9f2] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-500 resize-none" />
        </div>
      )}

      {apiError   && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{apiError}</div>}
      {successMsg && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{successMsg}</div>}
      {gps.error  && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">{gps.error}</div>}

      <button onClick={() => handleSubmit(action)} disabled={isPending}
        className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
          action === 'out' ? 'bg-red-600 hover:bg-red-700' : 'bg-navy-700 hover:bg-navy-800'
        }`}>
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
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-navy-900">الحضور والانصراف — جميع الموظفين</h1>

      {/* بطاقة تسجيل الحضور/الانصراف */}
      {!isLoading && (
        <AttendanceCard list={list} tenantApi={tenantApi} userId={user?.id} />
      )}

      {/* جدول السجلات */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">سجل الحضور</h2>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : list.length === 0 ? (
          <div className="bg-white border border-[#e4e9f2] rounded-2xl py-12 text-center text-sm text-slate-400">لا توجد سجلات حضور بعد</div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e4e9f2] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f4f6fb] border-b border-[#e4e9f2]">
                <tr>
                  {['الموظف','التاريخ','الحضور','الانصراف','النطاق','مأمورية','خصم','ملاحظات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e9f2]">
                {list.map(a => (
                  <tr key={a.id} className="hover:bg-navy-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-navy-900">{a.employee?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(a.check_in, 'date')}</td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">{fmt(a.check_in)}</td>
                    <td className="px-4 py-3 text-red-700 font-medium">{fmt(a.check_out)}</td>
                    <td className="px-4 py-3">
                      {a.is_outside_range
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">خارج النطاق</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">داخل النطاق</span>}
                    </td>
                    <td className="px-4 py-3">
                      {a.mission_id
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-navy-100 text-navy-700">مأمورية</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {a.deduction_sheet
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">{a.deduction_sheet.amount} ريال</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{a.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
