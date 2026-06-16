'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { contactApi } from '@/lib/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const mutation = useMutation({
    mutationFn: (data) => contactApi.send(data),
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form, {
      onSuccess: () => setForm({ name: '', email: '', subject: '', message: '' }),
    });
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-block bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">
            تواصل معنا
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">نحن هنا لمساعدتك</h2>
          <p className="mt-3 text-gray-500">
            فريقنا جاهز للإجابة على استفساراتك ومساعدتك في أي وقت. لا تتردد في التواصل معنا.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-purple-50/60 border border-purple-100 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          {mutation.isSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {mutation.data?.data?.message || 'تم استلام رسالتك بنجاح، شكرًا لتواصلك معنا!'}
            </div>
          )}
          {mutation.isError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {mutation.error?.response?.data?.message || 'حدث خطأ أثناء إرسال رسالتك، يرجى المحاولة مجدداً.'}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">الاسم</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="أدخل اسمك"
                className="h-11 rounded-lg border border-gray-200 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <input
                type="email"
                dir="ltr"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
                className="h-11 rounded-lg border border-gray-200 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">الموضوع</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              placeholder="ما موضوع استفسارك؟"
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">الرسالة</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder="اكتب رسالتك هنا..."
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-l from-violet-600 to-purple-600 shadow-md shadow-purple-600/20 hover:shadow-lg transition-shadow disabled:opacity-60"
          >
            {mutation.isPending ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
          </button>
        </form>
      </div>
    </section>
  );
}
