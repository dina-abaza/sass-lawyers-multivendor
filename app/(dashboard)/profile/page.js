'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';

const labelCls = 'block text-xs font-semibold text-[#4A5568] mb-1.5';
const inputCls = 'h-10 w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors';

export default function ProfilePage() {
  const { user, tenantApi, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '' });
  const [imagePreview, setImagePreview] = useState(user?.profile_image ?? null);
  const [imageFile, setImageFile] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const fileRef = useRef(null);

  const [passForm, setPassForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState(null);

  const profileMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('name', profileForm.name);
      if (imageFile) fd.append('profile_image', imageFile);
      return authApi.updateProfile(tenantApi, fd);
    },
    onSuccess: (res) => {
      const updated = res.data?.user ?? res.data?.data ?? res.data ?? {};
      updateUser({ name: profileForm.name, ...updated });
      if (updated?.profile_image) setImagePreview(updated.profile_image);
      setProfileSuccess(true);
      setProfileError(null);
      setImageFile(null);
      setTimeout(() => setProfileSuccess(false), 4000);
    },
    onError: (err) => {
      setProfileError(err?.response?.data?.message || 'حدث خطأ أثناء الحفظ');
      setProfileSuccess(false);
    },
  });

  const passMutation = useMutation({
    mutationFn: () => authApi.changePassword(tenantApi, passForm),
    onSuccess: () => {
      setPassSuccess(true);
      setPassError(null);
      setPassForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setPassSuccess(false), 4000);
    },
    onError: (err) => {
      setPassError(err?.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
      setPassSuccess(false);
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError(null);
    profileMutation.mutate();
  };

  const handlePassSubmit = (e) => {
    e.preventDefault();
    setPassError(null);
    if (passForm.new_password !== passForm.new_password_confirmation) {
      setPassError('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
      return;
    }
    passMutation.mutate();
  };

  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          {/* Avatar in header */}
          <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0 cursor-pointer"
            style={{ background: imagePreview ? 'transparent' : 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.4)' }}
            onClick={() => fileRef.current?.click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="صورة الملف" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold" style={{ color: '#D4AF37' }}>{initials}</span>
            )}
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الحساب</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>{user?.name || 'الملف الشخصي'}</h1>
            {user?.email && <p className="text-white/50 text-sm mt-0.5">{user.email}</p>}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      {/* البيانات الشخصية */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <div className="w-full h-1 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #D4AF37, #B8961F)' }} />
        <h2 className="font-semibold text-[#0A1628] mb-5 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          البيانات الشخصية
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          {/* صورة الملف الشخصي */}
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#F8F9FC', border: '1px solid #E2E6F0' }}>
            <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer shrink-0 transition-opacity hover:opacity-80"
              style={{ background: imagePreview ? 'transparent' : 'rgba(8,26,58,0.08)', border: '2px solid #E2E6F0' }}
              onClick={() => fileRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="صورة الملف" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-[#081A3A]">{initials}</span>
              )}
            </div>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="text-sm font-semibold transition-colors"
                style={{ color: '#D4AF37' }}>
                تغيير الصورة
              </button>
              <p className="text-xs text-[#8896A7] mt-0.5">JPG أو PNG — حجم أقصى 2MB</p>
            </div>
          </div>

          {/* الاسم */}
          <div>
            <label className={labelCls}>الاسم</label>
            <input
              value={profileForm.name}
              onChange={(e) => setProfileForm({ name: e.target.value })}
              required
              className={inputCls}
            />
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className={labelCls}>البريد الإلكتروني</label>
            <input
              value={user?.email ?? ''}
              disabled
              className="h-10 w-full rounded-xl border border-[#E2E6F0] bg-[#F0F2F7] px-3 text-sm text-[#8896A7] cursor-not-allowed"
            />
          </div>

          {profileError && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#991B1B' }}>
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', color: '#065F46' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              تم حفظ البيانات بنجاح
            </div>
          )}

          <button type="submit" disabled={profileMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
            {profileMutation.isPending
              ? <span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            حفظ التغييرات
          </button>
        </form>
      </div>

      {/* تغيير كلمة المرور */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <div className="w-full h-1 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #081A3A, #0D2452)' }} />
        <h2 className="font-semibold text-[#0A1628] mb-5 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#081A3A] inline-block" />
          تغيير كلمة المرور
        </h2>

        <form onSubmit={handlePassSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>كلمة المرور الحالية</label>
            <input
              type="password"
              value={passForm.current_password}
              onChange={(e) => setPassForm((p) => ({ ...p, current_password: e.target.value }))}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passForm.new_password}
              onChange={(e) => setPassForm((p) => ({ ...p, new_password: e.target.value }))}
              required
              minLength={8}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passForm.new_password_confirmation}
              onChange={(e) => setPassForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
              required
              minLength={8}
              className={inputCls}
            />
          </div>

          {passError && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#991B1B' }}>
              {passError}
            </div>
          )}
          {passSuccess && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', color: '#065F46' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              تم تغيير كلمة المرور بنجاح
            </div>
          )}

          <button type="submit" disabled={passMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff', boxShadow: '0 4px 12px rgba(8,26,58,0.2)' }}>
            {passMutation.isPending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>}
            تغيير كلمة المرور
          </button>
        </form>
      </div>
    </div>
  );
}
