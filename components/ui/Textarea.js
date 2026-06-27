export default function Textarea({ label, error, hint, className = '', required, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-navy-800">
          {label}
          {required && <span className="text-[#c0392b] ms-1">*</span>}
        </label>
      )}
      <textarea
        rows={3}
        className={`w-full rounded-xl border px-3.5 py-3 text-sm text-right bg-white outline-none transition-all duration-200 resize-none shadow-[0_1px_2px_rgba(8,26,58,0.04)]
          focus:ring-4 focus:ring-navy-700/10 focus:border-navy-600
          placeholder:text-[#8896a7]
          ${error
            ? 'border-[#c0392b]/50 focus:ring-[#c0392b]/10 focus:border-[#c0392b]'
            : 'border-[#e2e6f0] hover:border-navy-300'}`}
        {...props}
      />
      {hint && !error && <span className="text-xs text-[#8896a7]">{hint}</span>}
      {error && <span className="text-xs text-[#c0392b] font-medium">{error}</span>}
    </div>
  );
}
