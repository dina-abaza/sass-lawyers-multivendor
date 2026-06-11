export default function Textarea({ label, error, className = '', required, ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}
      <textarea
        rows={3}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-right bg-white outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
