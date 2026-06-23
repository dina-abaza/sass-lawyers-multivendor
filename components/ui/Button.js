'use client';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:  'bg-navy-700 text-white hover:bg-navy-800 focus:ring-navy-700/40 shadow-sm',
    secondary:'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50 focus:ring-navy-700/30',
    danger:   'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40 shadow-sm',
    ghost:    'text-navy-700 hover:bg-navy-50 focus:ring-navy-700/20',
    outline:  'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400/30',
    landing:  'bg-gradient-to-l from-navy-800 to-navy-600 text-white shadow-md shadow-navy-700/25 hover:shadow-lg focus:ring-navy-700/40',
    'landing-outline': 'border border-navy-300 text-navy-700 hover:bg-navy-50 focus:ring-navy-700/30',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size]} ${className}`}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  );
}
