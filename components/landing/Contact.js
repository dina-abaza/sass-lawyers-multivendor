'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { contactApi } from '@/lib/api';

const inputCls = 'h-11 rounded-xl border border-[#e4e9f2] px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-500 transition-colors placeholder:text-slate-400';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const mutation = useMutation({ mutationFn: (data) => contactApi.send(data) });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form, { onSuccess: () => setForm({ name: '', email: '', subject: '', message: '' }) });
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-block bg-navy-700 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">تواصل معنا</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">نحن هنا لمساعدتك</h2>
          <p className="mt-3 text-slate-500">فريقنا جاهز للإجابة على استفساراتك ومساعدتك في أي وقت.</p>
        </div>
        <form onSubmit={handleSubmit}
          className="bg-navy-50/50 border border-[#e4e9f2] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          {mutation.isSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {mutation.data?.data?.message || 'تم استلام رسالتك بنجاح، شكرًا لتواصلك معنا!'}
            </div>
          )}
          {mutation.isError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {mutation.error?.response?.data?.message || 'حدث خطأ أثناء إرسال رسالتك، يرجى المحاولة مجدداً.'}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">الاسم</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="أدخل اسمك" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
              <input type="email" dir="ltr" name="email" value={form.email} onChange={handleChange} required placeholder="example@email.com" className={inputCls} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">الموضوع</label>
            <input name="subject" value={form.subject} onChange={handleChange} required placeholder="ما موضوع استفسارك؟" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">الرسالة</label>
            <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="اكتب رسالتك هنا..."
              className="rounded-xl border border-[#e4e9f2] px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-navy-700/20 focus:border-navy-500 transition-colors resize-none placeholder:text-slate-400" />
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-navy-700 hover:bg-navy-800 shadow-sm shadow-navy-700/20 transition-colors disabled:opacity-60">
            {mutation.isPending ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
          </button>
        </form>
      </div>
    </section>
  );
}
