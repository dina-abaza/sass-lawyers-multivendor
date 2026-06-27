export default function Input({ label, error, hint, className = '', required, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-navy-800">
          {label}
          {required && <span className="text-[#c0392b] ms-1">*</span>}
        </label>
      )}
      <input
        className={`w-full h-11 rounded-xl border px-3.5 text-sm text-right bg-white outline-none transition-all duration-200 shadow-[0_1px_2px_rgba(8,26,58,0.04)]
          focus:ring-4 focus:ring-navy-700/10 focus:border-navy-600
          placeholder:text-[#8896a7]
          ${error
            ? 'border-[#c0392b]/50 focus:ring-[#c0392b]/10 focus:border-[#c0392b]'
            : 'border-[#e2e6f0] hover:border-navy-300'}`}
        {...props}
      />
      {hint && !error && <span className="text-xs text-[#8896a7]">{hint}</span>}
      {error && (
        <span className="text-xs text-[#c0392b] flex items-center gap-1 font-medium">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-2.99L13.74 4a2 2 0 00-3.48 0L3.33 16.01A2 2 0 005.07 19z" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
