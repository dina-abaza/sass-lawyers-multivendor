export default function Input({ label, error, hint, className = '', required, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}
      <input
        className={`w-full h-10 rounded-lg border px-3 text-sm text-right bg-white outline-none transition-all duration-150
          focus:ring-2 focus:ring-navy-700/25 focus:border-navy-600
          placeholder:text-gray-400
          ${error ? 'border-red-400 focus:ring-red-400/25 focus:border-red-500' : 'border-gray-200 hover:border-navy-300'}`}
        {...props}
      />
      {hint && !error && <span className="text-xs text-gray-400">{hint}</span>}
      {error && <span className="text-xs text-red-500 flex items-center gap-1">{error}</span>}
    </div>
  );
}
