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
    <div className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold leading-snug text-stone-900">
            {category.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
            {category.description}
          </p>
        </div>
        {selectable && (
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              selected
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-stone-300 bg-white'
            }`}
          >
            {selected && (
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current">
                <path d="M10.2 2.8 4.8 8.2 1.8 5.2l-.9.9 3.9 3.9 6.3-6.3-.9-.9Z" />
              </svg>
            )}
          </span>
        )}
      </div>

      <div className="mt-5 rounded-xl bg-stone-50 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Raised
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-700">
              {formatCurrency(category.totalRaised)}
            </p>
          </div>
          {category.targetAmount && (
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                Goal
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-700">
                {formatCurrency(category.targetAmount)}
              </p>
            </div>
          )}
        </div>

        {category.targetAmount && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-stone-500">
              <span>{Math.round(progress)}% funded</span>
              <span>
                {category.donorCount} donor{category.donorCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {!selectable && (
        <Link
          to={`/donations?program=${category.slug}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Donate Now
        </Link>
      )}
    </div>
  );

  const cardClasses = `overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-all duration-200 ${
    selectable
      ? selected
        ? 'ring-2 ring-emerald-500 ring-offset-2 shadow-md'
        : 'border border-stone-200 hover:border-emerald-300 hover:shadow-md'
      : 'border border-stone-200 hover:shadow-md'
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
