'use client';

import { useQuery } from '@tanstack/react-query';
import { centralApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import { useState } from 'react';

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-contacts', page],
    queryFn: () => centralApi.get(`/admin/contacts?page=${page}`).then(r => r.data),
  });

  const contacts = data?.data?.data ?? [];
  const meta     = data?.data ?? {};

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-navy-900">رسائل التواصل</h1>
        <p className="text-sm text-slate-500 mt-0.5">الرسائل الواردة من صفحة التواصل في الموقع</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-600">
          تعذّر تحميل الرسائل، يرجى المحاولة مجدداً.
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white border border-[#e4e9f2] rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">لا توجد رسائل حتى الآن</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* قائمة الرسائل */}
          <div className="lg:col-span-1 space-y-2">
            {contacts.map(c => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`w-full text-right rounded-xl border p-4 transition-all duration-150 ${
                  selected?.id === c.id
                    ? 'border-navy-300 bg-navy-50 shadow-sm'
                    : 'border-[#e4e9f2] bg-white hover:border-navy-200'
                }`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm flex-shrink-0">
                    {c.name?.charAt(0) ?? '؟'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-navy-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.subject}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(c.created_at).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {/* Pagination */}
            {(meta.last_page > 1) && (
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#e4e9f2] text-slate-600 hover:bg-navy-50 disabled:opacity-40">
                  السابق
                </button>
                <span className="text-xs text-slate-500">{page} / {meta.last_page}</span>
                <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#e4e9f2] text-slate-600 hover:bg-navy-50 disabled:opacity-40">
                  التالي
                </button>
              </div>
            )}
          </div>

          {/* تفاصيل الرسالة */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white border border-[#e4e9f2] rounded-2xl p-6 space-y-5 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-base flex-shrink-0">
                    {selected.name?.charAt(0) ?? '؟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy-900">{selected.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5" dir="ltr">{selected.email}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(selected.created_at).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="border-t border-[#e4e9f2] pt-4">
                  <p className="text-xs text-slate-400 mb-1">الموضوع</p>
                  <p className="font-semibold text-navy-900">{selected.subject}</p>
                </div>

                <div className="border-t border-[#e4e9f2] pt-4">
                  <p className="text-xs text-slate-400 mb-2">الرسالة</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                <div className="border-t border-[#e4e9f2] pt-4">
                  <a href={`mailto:${selected.email}?subject=رد: ${selected.subject}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-700 text-white text-sm font-medium hover:bg-navy-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    الرد عبر البريد
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#e4e9f2] rounded-2xl h-full flex items-center justify-center p-16 text-center">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400">اختر رسالة لعرض تفاصيلها</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
