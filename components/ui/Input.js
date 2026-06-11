export default function Input({
  label,
  error,
  className = '',
  required,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}
      <input
        className={`w-full h-10 rounded-lg border px-3 text-sm text-right bg-white outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
