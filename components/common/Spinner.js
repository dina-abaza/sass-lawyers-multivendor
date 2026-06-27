export default function Spinner({ size = 'md', className = '' }) {
  const dim = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const bw = { sm: 'border-2', md: 'border-[3px]', lg: 'border-4' };
  return (
    <div className={`relative ${dim[size]} ${className}`}>
      {/* faint track */}
      <div className={`absolute inset-0 rounded-full ${bw[size]} border-navy-200`} />
      {/* gold + navy sweep */}
      <div
        className={`absolute inset-0 rounded-full ${bw[size]} border-transparent border-t-gold-500 border-r-navy-700 animate-spin`}
      />
    </div>
  );
}
