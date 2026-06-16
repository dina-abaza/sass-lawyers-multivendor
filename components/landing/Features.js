const FEATURES = [
  {
    title: 'بوابة العملاء',
    desc: 'امنح عملائك إمكانية متابعة مستجدات قضاياهم من خلال بوابة آمنة ومخصصة.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h2a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2m3-9a3 3 0 11-6 0 3 3 0 016 0zm-9 9v-1a4 4 0 014-4h2a4 4 0 014 4v1" />
    ),
  },
  {
    title: 'متابعة المواعيد',
    desc: 'تنبيهات آلية للجلسات والمواعيد النهائية لضمان عدم تفويت أي موعد مهم.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
  {
    title: 'إدارة القضايا',
    desc: 'نظّم جميع ملفات القضايا والجلسات في مكان واحد مع سهولة الوصول للتفاصيل.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    ),
  },
  {
    title: 'تقارير وتحليلات',
    desc: 'لوحات تحكم تفاعلية تعرض أداء المكتب، الفواتير، ونسب نجاح القضايا.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6m6 13V10m-11 9h16M4 19l5-5 4 3 7-7" />
    ),
  },
  {
    title: 'أمان وخصوصية',
    desc: 'تشفير كامل للبيانات وحماية متقدمة لضمان سرية معلومات مكتبك وعملائك.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    ),
  },
  {
    title: 'أتمتة الوثائق',
    desc: 'أنشئ العقود والمذكرات القانونية تلقائياً باستخدام قوالب جاهزة وقابلة للتخصيص.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7.414a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0012.586 2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-purple-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">
            الميزات الرئيسية
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            كل ما تحتاجه في منصة واحدة
          </h2>
          <p className="mt-3 text-gray-500">
            أدوات شاملة متكاملة لإدارة مكتب المحاماة الخاص بك بكفاءة واحترافية عالية
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`rounded-2xl border border-purple-100/80 p-6 transition-shadow hover:shadow-lg hover:shadow-purple-900/5 ${
                i === 2 ? 'bg-purple-50' : 'bg-white'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  {f.icon}
                </svg>
              </div>
              <h3 className={`font-bold mb-1.5 ${i === 2 ? 'text-purple-700' : 'text-gray-900'}`}>
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
