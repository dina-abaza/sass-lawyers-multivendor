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
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">✓</div>
        <div>
          <p className="font-semibold text-green-800">تم تسجيل الحضور والانصراف اليوم</p>
          <p className="text-sm text-green-600 mt-0.5">
            حضور {fmt(todayRecord.check_in)} — انصراف {fmt(todayRecord.check_out)}
          </p>
        </div>
      </div>
    );
  }

  const action = checkedIn ? 'out' : 'in';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${checkedIn ? 'bg-green-500' : 'bg-gray-300'}`} />
        <h2 className="font-semibold text-gray-900">
          {checkedIn ? `حاضر منذ ${fmt(todayRecord.check_in)}` : 'لم يتم تسجيل الحضور اليوم'}
        </h2>
      </div>

      {/* GPS */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={gps.detect}
          disabled={gps.status === 'loading'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
        >
          {gps.status === 'loading' ? (
            <span className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          {gps.status === 'success' ? 'تم تحديد الموقع ✓' : 'تحديد الموقع تلقائياً'}
        </button>
        {gps.status === 'success' && (
          <span className="text-xs text-gray-400">
            {gps.coords.latitude.toFixed(4)}, {gps.coords.longitude.toFixed(4)}
          </span>
        )}
      </div>

      {/* Work location */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">موقع العمل</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">اختر موقع العمل</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {/* Mission toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setIsMission((v) => !v)}
          className={`w-10 h-6 rounded-full transition-colors ${isMission ? 'bg-blue-500' : 'bg-gray-200'} relative`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isMission ? 'right-1' : 'right-5'}`} />
        </div>
        <span className="text-sm text-gray-700">مأمورية خارجية</span>
      </label>

      {isMission && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">وصف المأمورية</label>
          <textarea
            rows={2}
            value={missionDesc}
            onChange={(e) => setMissionDesc(e.target.value)}
            placeholder="مثال: زيارة عميل في المحكمة التجارية"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>
      )}

      {/* Messages */}
      {apiError  && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{apiError}</p>}
      {successMsg && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{successMsg}</p>}
      {gps.error  && <p className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">{gps.error}</p>}

      {/* Action button */}
      <Button
        onClick={() => handleSubmit(action)}
        loading={isPending}
        className={action === 'out' ? 'bg-red-600 hover:bg-red-700' : ''}
      >
        {action === 'in' ? '📍 تسجيل الحضور' : '🚪 تسجيل الانصراف'}
      </Button>
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">الحضور والانصراف</h1>

      {/* بطاقة تسجيل الحضور/الانصراف */}
      {!isLoading && (
        <AttendanceCard list={list} tenantApi={tenantApi} userId={user?.id} />
      )}

      {/* جدول السجلات */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">سجل الحضور</h2>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 text-gray-400">لا توجد سجلات حضور بعد</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الموظف</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">التاريخ</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الحضور</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">الانصراف</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">النطاق</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">مأمورية</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.employee?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(a.check_in, 'date')}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">{fmt(a.check_in)}</td>
                    <td className="px-4 py-3 text-red-700 font-medium">{fmt(a.check_out)}</td>
                    <td className="px-4 py-3">
                      {a.is_outside_range
                        ? <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">خارج النطاق</span>
                        : <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">داخل النطاق</span>}
                    </td>
                    <td className="px-4 py-3">
                      {a.mission_id
                        ? <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">مأمورية</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{a.notes || '—'}</td>
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
