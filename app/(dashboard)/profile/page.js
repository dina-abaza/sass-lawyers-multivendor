'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import Button from '@/components/ui/Button';

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
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>

      {/* قسم تعديل البيانات */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 text-lg">البيانات الشخصية</h2>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          {/* صورة الملف الشخصي */}
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center cursor-pointer border-2 border-blue-200 hover:opacity-80 transition"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="صورة الملف" className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-700 font-bold text-2xl">{initials}</span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                تغيير الصورة
              </button>
              <p className="text-xs text-gray-400 mt-0.5">JPG أو PNG — حجم أقصى 2MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* الاسم */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">الاسم</label>
            <input
              value={profileForm.name}
              onChange={(e) => setProfileForm({ name: e.target.value })}
              required
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* البريد الإلكتروني (للعرض فقط) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <input
              value={user?.email ?? ''}
              disabled
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {profileError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">✓ تم حفظ البيانات بنجاح</p>
          )}

          <Button type="submit" loading={profileMutation.isPending}>حفظ التغييرات</Button>
        </form>
      </div>

      {/* قسم تغيير كلمة المرور */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-800 text-lg">تغيير كلمة المرور</h2>

        <form onSubmit={handlePassSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">كلمة المرور الحالية</label>
            <input
              type="password"
              value={passForm.current_password}
              onChange={(e) => setPassForm((p) => ({ ...p, current_password: e.target.value }))}
              required
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passForm.new_password}
              onChange={(e) => setPassForm((p) => ({ ...p, new_password: e.target.value }))}
              required
              minLength={8}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passForm.new_password_confirmation}
              onChange={(e) => setPassForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
              required
              minLength={8}
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {passError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{passError}</p>
          )}
          {passSuccess && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">✓ تم تغيير كلمة المرور بنجاح</p>
          )}

          <Button type="submit" loading={passMutation.isPending}>تغيير كلمة المرور</Button>
        </form>
      </div>
    </div>
  );
}
