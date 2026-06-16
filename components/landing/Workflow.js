const POINTS = [
  {
    title: 'إدارة متكاملة لكل تفاصيل عملك',
    desc: 'إضافة العملاء، إنشاء القضايا، وتسجيل الاستشارات من مكان واحد يسهّل عليك تنظيم العمل ومتابعته بكفاءة.',
    active: true,
  },
  {
    title: 'إدارة الحضور والانصراف بسهولة',
    desc: 'تسجيل حضور وانصراف الموظفين بالبصمة والموقع الجغرافي مع تقارير دقيقة ومباشرة.',
  },
  {
    title: 'إدارة مالية متكاملة لكل تفاصيل عملك',
    desc: 'فواتير، سندات قبض وصرف، وحسابات مالية مرتبطة تلقائياً بكل قضية وعميل.',
  },
];

const CARDS = [
  {
    title: 'إضافة عميل',
    desc: 'تسجيل عميل جديد في النظام',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM19 8v4m2-2h-4" />
    ),
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'إضافة قضية جديدة',
    desc: 'فتح ملف قضية جديدة',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7.414a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0012.586 2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    title: 'إضافة استشارة جديدة',
    desc: 'تسجيل استشارة قانونية',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    ),
    color: 'text-purple-600 bg-purple-50',
  },
];

export default function Workflow() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">
            طبيعة العمل
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">بيئة موحدة للعمل القانوني</h2>
          <p className="mt-3 text-gray-500">
            من إدارة المكتب إلى تنفيذ المهام اليومية للمحامين، يوفر لك النظام تجربة متكاملة لتنظيم العمل
            وتحقيق كفاءة أعلى.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* البطاقات المتراكبة */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 p-8 sm:p-10 space-y-4">
            {CARDS.map((c, i) => (
              <div
                key={c.title}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4"
                style={{ marginRight: `${i * 12}px` }}
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {c.icon}
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* قائمة النقاط */}
          <div className="space-y-4">
            {POINTS.map((p) => (
              <div
                key={p.title}
                className={`rounded-xl border p-5 transition-colors ${
                  p.active ? 'border-purple-300 bg-purple-50/70' : 'border-gray-100 bg-white'
                }`}
              >
                <h3 className={`font-bold mb-1.5 ${p.active ? 'text-purple-800' : 'text-gray-900'}`}>
                  {p.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
