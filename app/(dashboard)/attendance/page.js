'use client';

import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { attendanceApi, workLocationsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

function fmt(dt, mode = 'time') {
  if (!dt) return '—';
  const d = new Date(dt);
  if (mode === 'date') return d.toLocaleDateString('ar-SA');
  return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function isToday(dt) {
  if (!dt) return false;
  const d = new Date(dt);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function useGPS() {
  const [state, setState] = useState({ status: 'idle', coords: null, error: null });
  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', coords: null, error: 'المتصفح لا يدعم تحديد الموقع' });
      return;
    }
    setState({ status: 'loading', coords: null, error: null });
    navigator.geolocation.getCurrentPosition(
      pos => setState({ status: 'success', coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, error: null }),
      ()  => setState({ status: 'error', coords: null, error: 'تعذّر الحصول على الموقع — تأكد من منح الإذن' }),
      { timeout: 10000 }
    );
  }, []);
  return { ...state, detect };
}

export default function MyAttendancePage() {
  const { tenantApi, user } = useAuth();
  const qc = useQueryClient();
  const gps = useGPS();

  const [locationId, setLocationId] = useState('');
  const [isMission, setIsMission]   = useState(false);
  const [missionDesc, setMissionDesc] = useState('');
  const [apiMsg, setApiMsg]           = useState(null);
  const [isError, setIsError]         = useState(false);

  const { data: locData } = useQuery({
    queryKey: ['work-locations'],
    queryFn: () => workLocationsApi.getAll(tenantApi).then(r => r.data),
    enabled: !!tenantApi,
  });
  const locations = Array.isArray(locData) ? locData : locData?.data ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: () => attendanceApi.getAll(tenantApi).then(r => r.data),
    enabled: !!tenantApi,
  });
  const list = (Array.isArray(data) ? data : data?.data ?? [])
    .filter(a => a.user_id === user?.id);

  const todayRecord = list.find(a => isToday(a.check_in));
  const checkedIn   = !!todayRecord;
  const checkedOut  = !!todayRecord?.check_out;
  const action      = checkedIn && !checkedOut ? 'out' : 'in';

  const onSuccess = (res) => {
    setApiMsg(res.data?.message || 'تم بنجاح');
    setIsError(false);
    qc.invalidateQueries({ queryKey: ['my-attendance'] });
  };
  const onError = (err) => {
    setApiMsg(err.response?.data?.message || 'حدث خطأ');
    setIsError(true);
  };

  const checkInMutation  = useMutation({ mutationFn: p => attendanceApi.checkIn(tenantApi, p),  onSuccess, onError });
  const checkOutMutation = useMutation({ mutationFn: p => attendanceApi.checkOut(tenantApi, p), onSuccess, onError });
  const isPending = checkInMutation.isPending || checkOutMutation.isPending;

  function handleSubmit() {
    setApiMsg(null);
    if (!gps.coords)  return (setApiMsg('يجب تحديد موقعك الجغرافي أولاً'), setIsError(true));
    if (!locationId)  return (setApiMsg('يجب اختيار موقع العمل'), setIsError(true));
    if (isMission && !missionDesc.trim()) return (setApiMsg('يجب إدخال وصف المأمورية'), setIsError(true));

    const payload = {
      latitude: gps.coords.latitude,
      longitude: gps.coords.longitude,
      work_location_id: locationId,
      ...(isMission && { is_on_mission: true, mission_description: missionDesc }),
    };
    action === 'in' ? checkInMutation.mutate(payload) : checkOutMutation.mutate(payload);
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy-900">حضوري اليوم</h1>
        <p className="text-sm text-slate-500 mt-0.5">تسجيل حضورك وانصرافك</p>
      </div>

      {/* بطاقة الحالة */}
      {checkedIn && checkedOut ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-emerald-800">تم تسجيل حضورك وانصرافك اليوم</p>
            <p className="text-sm text-emerald-600 mt-0.5">
              حضور {fmt(todayRecord.check_in)} — انصراف {fmt(todayRecord.check_out)}
            </p>
            {todayRecord.deduction_sheet && (
              <p className="text-xs text-red-600 mt-1">
                تم خصم {todayRecord.deduction_sheet.amount} ريال (خارج النطاق)
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#e4e9f2] rounded-2xl p-5 space-y-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${checkedIn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className="text-sm font-medium text-slate-700">
              {checkedIn ? `حاضر منذ ${fmt(todayRecord.check_in)}` : 'لم يتم تسجيل الحضور اليوم'}
            </span>
          </div>

          {/* GPS */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={gps.detect} disabled={gps.status === 'loading'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                gps.status === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-[#e4e9f2] text-slate-600 hover:bg-navy-50 hover:border-navy-200'
              } disabled:opacity-50`}>
              {gps.status === 'loading'
                ? <span className="w-4 h-4 border-2 border-slate-300 border-t-navy-600 rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              }
              {gps.status === 'success' ? 'تم تحديد الموقع ✓' : 'تحديد موقعي تلقائياً'}
            </button>
            {gps.status === 'success' && (
              <span className="text-xs text-slate-400 font-mono">
                {gps.coords.latitude.toFixed(4)}, {gps.coords.longitude.toFixed(4)}
              </span>
            )}
          </div>

          {/* Work location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">موقع العمل</label>
            <select value={locationId} onChange={e => setLocationId(e.target.value)}
              className="h-11 rounded-xl border border-[#e4e9f2] px-3 text-sm outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-500 bg-white transition-colors">
              <option value="">اختر موقع العمل</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          {/* Mission toggle */}
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
                className="rounded-xl border border-[#e4e9f2] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-500 resize-none transition-colors" />
            </div>
          )}

          {/* Messages */}
          {apiMsg && (
            <div className={`rounded-xl px-4 py-3 text-sm ${isError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
              {apiMsg}
            </div>
          )}
          {gps.error && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">{gps.error}</div>
          )}

          {/* Action button */}
          <button onClick={handleSubmit} disabled={isPending}
            className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
              action === 'out' ? 'bg-red-600 hover:bg-red-700' : 'bg-navy-700 hover:bg-navy-800'
            }`}>
            {isPending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : action === 'in'
              ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> تسجيل الحضور</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> تسجيل الانصراف</>
            }
          </button>
        </div>
      )}

      {/* سجل حضوري */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">سجل حضوري</h2>
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : list.length === 0 ? (
          <div className="bg-white border border-[#e4e9f2] rounded-2xl py-10 text-center text-sm text-slate-400">
            لا توجد سجلات حضور بعد
          </div>
        ) : (
          <div className="bg-white border border-[#e4e9f2] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f4f6fb] border-b border-[#e4e9f2]">
                <tr>
                  {['التاريخ','الحضور','الانصراف','النطاق','مأمورية','خصم'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e9f2]">
                {list.map(a => (
                  <tr key={a.id} className="hover:bg-navy-50/30 transition-colors">
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
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                            {a.deduction_sheet.amount} ريال
                          </span>
                        : <span className="text-slate-300">—</span>}
                    </td>
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
