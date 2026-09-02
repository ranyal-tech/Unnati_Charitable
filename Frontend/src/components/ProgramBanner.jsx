import { useState } from 'react';
import { getProgramTheme } from '../utils/programTheme';
import { getProgramImageUrl } from '../utils/programImages';

export default function ProgramBanner({ category, selected = false, className = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const theme = getProgramTheme(category.slug);
  const imageUrl = getProgramImageUrl(category);
  const showImage = imageUrl && !imageFailed;

  if (showImage) {
    return (
      <div className={`relative aspect-[16/9] overflow-hidden rounded-2xl bg-stone-100 ${className}`}>
        <img
          src={imageUrl}
          alt={category.name}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {selected && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-brand-900/20">
            Selected
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} text-white ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_55%)]" />
      <div className="relative flex flex-col items-center gap-2 opacity-95">
        {theme.icon}
        <span className="text-xs font-medium uppercase tracking-widest text-white/80">
          Donation Program
        </span>
      </div>
      {selected && (
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-800 shadow-lg">
          Selected
        </span>
      )}
    </div>
  );
}
