'use client';

import { useState } from 'react';

const ITEMS = [
  {
    title: 'إدارة متكاملة لكل تفاصيل عملك',
    desc: 'إضافة العملاء، إنشاء القضايا، وتسجيل الاستشارات من مكان واحد يسهّل عليك تنظيم العمل.',
    visual: (
      <div className="space-y-3">
        {[
          { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'إضافة عميل جديد', color: 'bg-navy-50 text-navy-700' },
          { icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', label: 'فتح قضية جديدة', color: 'bg-emerald-50 text-emerald-700' },
          { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'تسجيل استشارة', color: 'bg-amber-50 text-amber-700' },
        ].map((c, i) => (
          <div key={c.label} className="bg-white rounded-xl border border-[#e4e9f2] shadow-sm p-4 flex items-center gap-3"
            style={{ marginRight: `${i * 10}px` }}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={c.icon} />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">{c.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'إدارة الحضور والانصراف بسهولة',
    desc: 'تسجيل حضور وانصراف الموظفين مع تقارير دقيقة ومباشرة.',
    visual: (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-3">
          <span>الحالة</span>
          <span>وقت الانصراف</span>
          <span>وقت الحضور</span>
          <span>الموظف</span>
        </div>
        {[
          { status: 'حاضر', statusColor: 'bg-emerald-100 text-emerald-700', in: '08:30', out: '—' },
          { status: 'حاضر', statusColor: 'bg-emerald-100 text-emerald-700', in: '09:00', out: '—' },
          { status: 'انصرف', statusColor: 'bg-slate-100 text-slate-500',   in: '08:45', out: '17:00' },
          { status: 'غائب',  statusColor: 'bg-red-100 text-red-600',       in: '—',     out: '—' },
        ].map((row, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e4e9f2] px-4 py-3 flex items-center justify-between gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.statusColor}`}>{row.status}</span>
            <span className="text-xs text-slate-500 font-mono">{row.out}</span>
            <span className="text-xs text-slate-500 font-mono">{row.in}</span>
            <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'إدارة مالية متكاملة',
    desc: 'فواتير، سندات قبض وصرف، وحسابات مالية مرتبطة تلقائياً بكل قضية وعميل.',
    visual: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'إجمالي الفواتير', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', color: 'bg-navy-50 text-navy-700' },
            { label: 'سندات القبض',    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-50 text-emerald-700' },
          ].map(c => (
            <div key={c.label} className="bg-white border border-[#e4e9f2] rounded-xl p-4 flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={c.icon} />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-600">{c.label}</span>
            </div>
          ))}
        </div>
        {[
          { label: 'فاتورة — قضية مدنية', type: 'مدفوعة', typeColor: 'text-emerald-600 bg-emerald-50' },
          { label: 'سند قبض — استشارة',   type: 'معلقة',  typeColor: 'text-amber-600 bg-amber-50' },
          { label: 'فاتورة — قضية تجارية', type: 'مدفوعة', typeColor: 'text-emerald-600 bg-emerald-50' },
        ].map((row, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e4e9f2] px-4 py-3 flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.typeColor}`}>{row.type}</span>
            <span className="text-sm text-slate-700">{row.label}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Workflow() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block bg-navy-700 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">طبيعة العمل</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">بيئة موحدة للعمل القانوني</h2>
          <p className="mt-3 text-slate-500">من إدارة المكتب إلى تنفيذ المهام اليومية، يوفر لك النظام تجربة متكاملة لتنظيم العمل.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Visual panel */}
          <div className="bg-gradient-to-br from-navy-50 to-white rounded-2xl border border-[#e4e9f2] p-6 min-h-[280px]">
            <div key={active} className="animate-fadeIn">
              {ITEMS[active].visual}
            </div>
          </div>

          {/* Clickable points */}
          <div className="space-y-3">
            {ITEMS.map((item, i) => (
              <button key={item.title} onClick={() => setActive(i)}
                className={`w-full text-right rounded-xl border p-5 transition-all duration-200 ${
                  active === i
                    ? 'border-navy-300 bg-navy-50 shadow-sm'
                    : 'border-[#e4e9f2] bg-white hover:border-navy-200 hover:bg-navy-50/50'
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    active === i ? 'bg-navy-700' : 'bg-gray-200'
                  }`}>
                    {active === i && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 text-sm ${active === i ? 'text-navy-800' : 'text-slate-700'}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
