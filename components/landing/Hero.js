'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Hero() {
  const [email, setEmail] = useState('');

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-purple-50/60 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* المعاينة المرئية للوحة التحكم */}
        <div className="relative order-2 lg:order-1 hidden sm:block">
          <div className="absolute -inset-10 bg-purple-200/40 rounded-full blur-3xl -z-10" />

          {/* بطاقة إجمالي القضايا */}
          <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/10 border border-gray-100 p-5 max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">إجمالي القضايا</span>
              <span className="text-[10px] text-gray-400">88%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full mb-4">
              <div className="h-1.5 w-[88%] bg-gradient-to-l from-violet-500 to-purple-500 rounded-full" />
            </div>
            <div className="flex items-end gap-3 h-20">
              {[40, 90, 75, 55].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-md ${i === 1 ? 'bg-purple-600' : 'bg-purple-200'}`}
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-gray-400">الإسبوع {4 - i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* بطاقة شهادة عميل */}
          <div className="absolute top-6 -left-4 sm:-left-10 bg-white rounded-xl shadow-lg shadow-purple-900/10 border border-gray-100 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              ع.ق
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">عبدالله القحطاني</p>
              <p className="text-[11px] text-amber-500">★★★★★ 4.5</p>
            </div>
          </div>

          {/* بطاقة إجمالي الأرباح */}
          <div className="bg-white rounded-2xl shadow-xl shadow-purple-900/10 border border-gray-100 p-5 mt-6 max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">إجمالي الأرباح</span>
              <span className="text-xs font-bold text-purple-700">45,591 ر.س</span>
            </div>
            <svg viewBox="0 0 200 60" className="w-full h-14">
              <polyline
                points="0,40 25,35 50,45 75,20 100,30 125,15 150,25 175,10 200,20"
                fill="none"
                stroke="#9333ea"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="0,50 25,48 50,52 75,40 100,45 125,38 150,42 175,33 200,38"
                fill="none"
                stroke="#e9d5ff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* النص الرئيسي */}
        <div className="order-1 lg:order-2 text-center lg:text-right">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            إدارة <span className="text-purple-700">ذكية ومتكاملة</span> لمكتب المحاماة الخاص بك
          </h1>
          <p className="mt-5 text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 lg:mr-0">
            نظام سحابي شامل يجمع بين إدارة القضايا، العملاء، والفواتير في منصة واحدة. مصمم
            خصيصاً للمحامين في المملكة العربية السعودية لزيادة الإنتاجية وتنظيم العمل.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-l from-violet-600 to-purple-600 shadow-lg shadow-purple-600/25 hover:shadow-xl transition-shadow w-full sm:w-auto justify-center"
            >
              جرب مجاناً
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>

            <Link
              href={{ pathname: '/register', query: email ? { email } : {} }}
              className="w-full sm:w-auto flex items-center gap-2 bg-white border border-gray-200 rounded-full pe-2 ps-4 h-[52px]"
            >
              <input
                type="email"
                dir="ltr"
                value={email}
                onClick={(e) => e.preventDefault()}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none text-right min-w-0"
              />
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            تجربة مجانية لمدة 14 يوم • لا يلزم وجود بطاقة ائتمان
          </p>
        </div>
      </div>
    </section>
  );
}
