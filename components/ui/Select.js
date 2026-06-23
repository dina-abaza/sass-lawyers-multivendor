export default function Select({ label, error, options = [], placeholder = '— اختر —', className = '', required, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}
      <select
        className={`w-full h-10 rounded-lg border px-3 text-sm bg-white outline-none transition-all duration-150
          focus:ring-2 focus:ring-navy-700/25 focus:border-navy-600
          ${error ? 'border-red-400' : 'border-gray-200 hover:border-navy-300'}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
