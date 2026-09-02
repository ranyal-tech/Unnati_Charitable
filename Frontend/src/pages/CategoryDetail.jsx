import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DonateForm from '../components/DonateForm';
import ProgramBanner from '../components/ProgramBanner';
import { getCategories, getCategoryBySlug } from '../services/api';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CategoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([getCategoryBySlug(slug), getCategories()])
      .then(([categoryData, allPrograms]) => {
        setCategory(categoryData);
        setPrograms(allPrograms);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card h-96 animate-pulse bg-stone-100" />
      </section>
    );
  }

  if (error || !category) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          {error || 'Program not found'}
        </div>
        <Link to="/donations" className="mt-4 inline-block font-medium text-brand-700 hover:underline">
          ← Back to all programs
        </Link>
      </section>
    );
  }

  const progress = category.targetAmount
    ? Math.min((category.totalRaised / category.targetAmount) * 100, 100)
    : 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <Link
        to="/donations"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        ← Back to all programs
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <ProgramBanner category={category} className="shadow-lg shadow-stone-200/50" />

          <div className="mt-8">
            <p className="section-eyebrow">Program</p>
            <h1 className="font-display mt-2 text-4xl font-bold text-stone-900">{category.name}</h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">{category.description}</p>

            <div className="card mt-8 p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Raised</p>
                  <p className="font-display mt-1 text-3xl font-bold text-brand-700">
                    {formatCurrency(category.totalRaised)}
                  </p>
                </div>
                {category.targetAmount && (
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Goal</p>
                    <p className="mt-1 text-lg font-semibold text-stone-800">
                      {formatCurrency(category.targetAmount)}
                    </p>
                  </div>
                )}
              </div>

              {category.targetAmount && (
                <div className="mt-5">
                  <div className="progress-bar !h-3">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-stone-500">
                    {Math.round(progress)}% funded · {category.donorCount} generous donor
                    {category.donorCount !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DonateForm
          categorySlug={category.slug}
          categoryName={category.name}
          programs={programs}
          onProgramChange={(nextSlug) => navigate(`/donations/${nextSlug}`)}
        />
      </div>
    </section>
  );
}
