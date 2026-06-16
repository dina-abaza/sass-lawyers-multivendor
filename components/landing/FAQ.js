'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'ما هي أنواع البيانات التي يدعمها النظام؟',
    a: 'يدعم النظام إدارة القضايا، العملاء، الجلسات، المهام، العقود، الفواتير، والمستندات القانونية، بالإضافة إلى الحضور والانصراف والإدارة المالية الكاملة.',
  },
  {
    q: 'هل يوفر النظام نسخة تجريبية مجانية؟',
    a: 'نعم، يمكنك تجربة النظام مجاناً لمدة 14 يوماً كاملة دون الحاجة لإدخال بيانات بطاقة ائتمان.',
  },
  {
    q: 'هل يمكنني ترقية أو تخفيض باقتي في أي وقت؟',
    a: 'بالتأكيد، يمكنك تغيير باقتك في أي وقت من لوحة التحكم بما يتناسب مع احتياجات مكتبك المتغيّرة.',
  },
  {
    q: 'هل بياناتي آمنة؟',
    a: 'نعم، نعتمد على تشفير كامل للبيانات وحماية متقدمة لضمان سرية معلومات مكتبك وعملائك في جميع الأوقات.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-white to-purple-50/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="inline-block bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">
            الأسئلة الشائعة
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">أسئلة الشائعة</h2>
        </div>

        <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100 px-2 sm:px-4">
          {QUESTIONS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="py-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 py-4 text-right"
                >
                  <span className="font-medium text-gray-900">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-purple-600 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <p className="pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
