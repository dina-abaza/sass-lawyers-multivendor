export default function Select({ label, error, options = [], placeholder = '— اختر —', className = '', required, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-navy-800">
          {label}
          {required && <span className="text-[#c0392b] ms-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full h-11 rounded-xl border ps-3.5 pe-10 text-sm bg-white outline-none transition-all duration-200 appearance-none cursor-pointer shadow-[0_1px_2px_rgba(8,26,58,0.04)]
            focus:ring-4 focus:ring-navy-700/10 focus:border-navy-600
            ${error
              ? 'border-[#c0392b]/50 focus:ring-[#c0392b]/10 focus:border-[#c0392b]'
              : 'border-[#e2e6f0] hover:border-navy-300'}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896a7]"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error && <span className="text-xs text-[#c0392b] font-medium">{error}</span>}
    </div>
  );
}
