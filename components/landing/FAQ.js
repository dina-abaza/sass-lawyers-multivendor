'use client';

import { useState } from 'react';

const QUESTIONS = [
  { q: 'ما هي أنواع البيانات التي يدعمها النظام؟', a: 'يدعم النظام إدارة القضايا، العملاء، الجلسات، المهام، العقود، الفواتير، والمستندات القانونية، بالإضافة إلى الحضور والانصراف والإدارة المالية الكاملة.' },
  { q: 'هل يوفر النظام نسخة تجريبية مجانية؟', a: 'نعم، يمكنك تجربة النظام مجاناً لمدة 30 يوماً كاملة دون الحاجة لإدخال بيانات بطاقة ائتمان.' },
  { q: 'هل يمكنني ترقية أو تخفيض باقتي في أي وقت؟', a: 'بالتأكيد، يمكنك تغيير باقتك في أي وقت من لوحة التحكم بما يتناسب مع احتياجات مكتبك المتغيّرة.' },
  { q: 'هل بياناتي آمنة؟', a: 'نعم، نعتمد على تشفير كامل للبيانات وحماية متقدمة لضمان سرية معلومات مكتبك وعملائك في جميع الأوقات.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-white to-navy-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="inline-block bg-navy-700 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">الأسئلة الشائعة</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">أجوبة على أبرز الأسئلة</h2>
        </div>
        <div className="bg-white rounded-2xl border border-[#e4e9f2] divide-y divide-[#e4e9f2] overflow-hidden shadow-sm">
          {QUESTIONS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q}>
                <button type="button" onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right hover:bg-navy-50/50 transition-colors">
                  <span className={`font-medium text-sm ${isOpen ? 'text-navy-700' : 'text-slate-800'}`}>{item.q}</span>
                  <svg className={`w-4 h-4 text-navy-600 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
                  <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
