'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

function CreateUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => adminApi.createUser(data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(err.response?.data?.message || 'حدث خطأ'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">إضافة مستخدم جديد</h2>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
          <Button onClick={() => mutation.mutate(form)} loading={mutation.isPending}>إضافة</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const list = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-sm text-gray-500 mt-1">عرض وإدارة جميع مستخدمي النظام</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ إضافة مستخدم</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">لا يوجد مستخدمون</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">الأدوار</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">المكتب (Tenant)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">تاريخ الإنشاء</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((u, idx) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600 dir-ltr text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(u.roles || u.all_roles || []).map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {r?.name || r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.tenant_id || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.created_at?.substring(0, 10) || '—'}</td>
                  <td className="px-4 py-3 text-left">
                    <button
                      onClick={() => { if (confirm('حذف هذا المستخدم؟')) deleteMutation.mutate(u.id); }}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => qc.invalidateQueries({ queryKey: ['admin-users'] })}
        />
      )}
    </div>
  );
}
