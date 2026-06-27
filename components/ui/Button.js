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
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 active:scale-[0.98] select-none whitespace-nowrap';

  const variants = {
    // Deep navy primary
    primary:
      'bg-navy-800 text-white shadow-[0_4px_12px_rgba(8,26,58,0.22)] hover:bg-navy-700 hover:shadow-[0_6px_20px_rgba(8,26,58,0.30)] focus-visible:ring-navy-700/40',
    // Rich gold accent
    gold:
      'bg-gold-500 text-navy-900 shadow-[0_4px_12px_rgba(212,175,55,0.30)] hover:bg-gold-400 hover:shadow-[0_6px_20px_rgba(212,175,55,0.40)] focus-visible:ring-gold-500/50',
    accent:
      'bg-gold-500 text-navy-900 shadow-[0_4px_12px_rgba(212,175,55,0.30)] hover:bg-gold-400 hover:shadow-[0_6px_20px_rgba(212,175,55,0.40)] focus-visible:ring-gold-500/50',
    secondary:
      'bg-white text-navy-800 border border-navy-200 shadow-sm hover:bg-navy-50 hover:border-navy-300 focus-visible:ring-navy-700/25',
    danger:
      'bg-[#c0392b] text-white shadow-[0_4px_12px_rgba(192,57,43,0.22)] hover:bg-[#a93226] hover:shadow-[0_6px_20px_rgba(192,57,43,0.32)] focus-visible:ring-[#c0392b]/40',
    ghost:
      'text-navy-700 hover:bg-navy-50 hover:text-navy-800 focus-visible:ring-navy-700/20',
    outline:
      'border border-navy-200 text-navy-700 hover:bg-navy-50 hover:border-navy-300 focus-visible:ring-navy-700/25',
    landing:
      'bg-gradient-to-l from-navy-900 to-navy-700 text-white shadow-[0_6px_20px_rgba(8,26,58,0.30)] hover:shadow-[0_10px_28px_rgba(8,26,58,0.40)] focus-visible:ring-navy-700/40',
    'landing-outline':
      'border border-gold-500/60 text-navy-800 hover:bg-gold-50 hover:border-gold-500 focus-visible:ring-gold-500/30',
  };

  const sizes = {
    sm: 'h-8 px-3.5 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-7 text-sm',
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
