export default function Logo({ size = 44, showText = false, className = '', variant = 'default' }) {
  const textPrimary = variant === 'light' ? 'text-white' : 'text-brand-900';
  const textSecondary = variant === 'light' ? 'text-stone-400' : 'text-stone-500';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="Unnati Charitable Trust"
        height={size}
        className="shrink-0 object-contain"
        style={{
          height: size,
          width: 'auto',
          maxWidth: size * 4.5,
        }}
      />

      {showText && (
        <div className="min-w-0">
          <p className={`font-display text-lg font-bold leading-tight tracking-tight sm:text-xl ${textPrimary}`}>
            Unnati Charitable Trust
          </p>
          <p className={`text-xs font-medium tracking-wide ${textSecondary}`}>
            Together we rise
          </p>
        </div>
      )}
    </div>
  );
}
