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

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الموارد البشرية</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>حضوري اليوم</h1>
            <p className="text-white/50 text-sm mt-0.5">تسجيل حضورك وانصرافك</p>
          </div>
        </div>
      </div>

      {/* بطاقة الحالة */}
      {checkedIn && checkedOut ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
        <div className="bg-white border border-[#E2E6F0] rounded-2xl p-5 space-y-4 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">

          {/* Status indicator */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0F2F7]">
            <div className={`w-2.5 h-2.5 rounded-full ${checkedIn ? 'bg-emerald-500' : 'bg-[#8896A7]'}`} />
            <span className="text-sm font-medium text-[#4A5568]">
              {checkedIn ? `حاضر منذ ${fmt(todayRecord.check_in)}` : 'لم يتم تسجيل الحضور اليوم'}
            </span>
          </div>

          {/* GPS */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={gps.detect} disabled={gps.status === 'loading'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                gps.status === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-[#E2E6F0] text-[#4A5568] hover:bg-[#EBF0FA] hover:border-[#081A3A]/20 hover:text-[#081A3A]'
              } disabled:opacity-50`}>
              {gps.status === 'loading'
                ? <span className="w-4 h-4 border-2 border-[#8896A7] border-t-[#081A3A] rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              }
              {gps.status === 'success' ? 'تم تحديد الموقع ✓' : 'تحديد موقعي تلقائياً'}
            </button>
            {gps.status === 'success' && (
              <span className="text-xs text-[#8896A7] font-mono bg-[#F8F9FC] px-2 py-1 rounded-lg border border-[#E2E6F0]">
                {gps.coords.latitude.toFixed(4)}, {gps.coords.longitude.toFixed(4)}
              </span>
            )}
          </div>

          {/* Work location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#4A5568]">موقع العمل</label>
            <select value={locationId} onChange={e => setLocationId(e.target.value)}
              className="h-10 rounded-xl border border-[#E2E6F0] px-3 text-sm outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] bg-white text-[#0A1628] transition-colors">
              <option value="">اختر موقع العمل</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          {/* Mission toggle */}
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
              <label className="text-sm font-medium text-[#4A5568]">وصف المأمورية</label>
              <textarea rows={2} value={missionDesc} onChange={e => setMissionDesc(e.target.value)}
                placeholder="مثال: زيارة عميل في المحكمة التجارية"
                className="rounded-xl border border-[#E2E6F0] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] resize-none transition-colors text-[#0A1628] placeholder:text-[#8896A7]" />
            </div>
          )}

          {/* Messages */}
          {apiMsg && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
              isError
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}>
              {apiMsg}
            </div>
          )}
          {gps.error && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">{gps.error}</div>
          )}

          {/* Action button */}
          <button onClick={handleSubmit} disabled={isPending}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(8,26,58,0.2)] active:scale-[0.98]"
            style={{
              background: action === 'out'
                ? 'linear-gradient(135deg, #C0392B, #E74C3C)'
                : 'linear-gradient(135deg, #081A3A, #0D2452)'
            }}>
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
        <h2 className="text-sm font-semibold text-[#0A1628] mb-3 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          سجل حضوري
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]"><Spinner /></div>
        ) : list.length === 0 ? (
          <div className="bg-white border border-[#E2E6F0] rounded-2xl py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F8F9FC] flex items-center justify-center mx-auto mb-3 border border-[#E2E6F0]">
              <svg className="w-6 h-6 text-[#8896A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-[#8896A7]">لا توجد سجلات حضور بعد</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E6F0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F9FC] border-b border-[#E2E6F0]">
                <tr>
                  {['التاريخ','الحضور','الانصراف','النطاق','مأمورية','خصم'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-[#4A5568] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {list.map(a => (
                  <tr key={a.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="px-4 py-3 text-[#4A5568] text-xs">{fmt(a.check_in, 'date')}</td>
                    <td className="px-4 py-3 text-emerald-700 font-semibold">{fmt(a.check_in)}</td>
                    <td className="px-4 py-3 text-red-600 font-semibold">{fmt(a.check_out)}</td>
                    <td className="px-4 py-3">
                      {a.is_outside_range
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-100 font-medium">خارج النطاق</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">داخل النطاق</span>}
                    </td>
                    <td className="px-4 py-3">
                      {a.mission_id
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-[#EBF0FA] text-[#081A3A] border border-[#081A3A]/10 font-medium">مأمورية</span>
                        : <span className="text-[#8896A7]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {a.deduction_sheet
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700 border border-red-100 font-medium">
                            {a.deduction_sheet.amount} ريال
                          </span>
                        : <span className="text-[#8896A7]">—</span>}
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
