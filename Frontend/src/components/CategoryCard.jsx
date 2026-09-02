import { Link } from 'react-router-dom';
import ProgramBanner from './ProgramBanner';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CategoryCard({
  category,
  selectable = false,
  selected = false,
  onSelect,
}) {
  const progress = category.targetAmount
    ? Math.min((category.totalRaised / category.targetAmount) * 100, 100)
    : 0;

  const cardBody = (
    <div className="flex h-full flex-col p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold leading-snug text-stone-900">
            {category.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
            {category.description}
          </p>
        </div>
        {selectable && (
          <span
            aria-hidden="true"
            className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              selected
                ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                : 'border-stone-300 bg-white'
            }`}
          >
            {selected && (
              <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
                <path d="M10.2 2.8 4.8 8.2 1.8 5.2l-.9.9 3.9 3.9 6.3-6.3-.9-.9Z" />
              </svg>
            )}
          </span>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-br from-stone-50 to-brand-50/40 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Raised</p>
            <p className="font-display mt-1 text-2xl font-bold text-brand-700">
              {formatCurrency(category.totalRaised)}
            </p>
          </div>
          {category.targetAmount && (
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Goal</p>
              <p className="mt-1 text-sm font-semibold text-stone-700">
                {formatCurrency(category.targetAmount)}
              </p>
            </div>
          )}
        </div>

        {category.targetAmount && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs font-medium text-stone-500">
              <span>{Math.round(progress)}% funded</span>
              <span>
                {category.donorCount} donor{category.donorCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {!selectable && (
        <Link
          to={`/donations?program=${category.slug}`}
          className="btn-primary mt-5 w-full !rounded-2xl"
        >
          Donate Now
        </Link>
      )}
    </div>
  );

  const cardClasses = `card card-hover overflow-hidden text-left ${
    selectable
      ? selected
        ? 'ring-2 ring-brand-500 ring-offset-2 shadow-lg shadow-brand-100/50'
        : 'cursor-pointer'
      : ''
  }`;

  if (selectable) {
    return (
      <button type="button" onClick={() => onSelect?.(category)} className={cardClasses}>
        <ProgramBanner category={category} selected={selected} className="rounded-none" />
        {cardBody}
      </button>
    );
  }

  return (
    <article className={cardClasses}>
      <ProgramBanner category={category} className="rounded-none" />
      {cardBody}
    </article>
  );
}
