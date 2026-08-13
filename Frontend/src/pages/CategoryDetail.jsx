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
        <p className="text-stone-500">Loading program details...</p>
      </section>
    );
  }

  if (error || !category) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
          {error || 'Program not found'}
        </div>
        <Link to="/donations" className="mt-4 inline-block text-emerald-700 hover:underline">
          Back to all programs
        </Link>
      </section>
    );
  }

  const progress = category.targetAmount
    ? Math.min((category.totalRaised / category.targetAmount) * 100, 100)
    : 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Link to="/donations" className="text-sm font-medium text-emerald-700 hover:underline">
        ← Back to all programs
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <ProgramBanner category={category} />

          <div className="mt-6">
            <h1 className="text-4xl font-bold text-stone-900">{category.name}</h1>
            <p className="mt-4 leading-relaxed text-stone-600">{category.description}</p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">Total Raised</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(category.totalRaised)}
                  </p>
                </div>
                {category.targetAmount && (
                  <div className="text-right">
                    <p className="text-sm text-stone-500">Goal</p>
                    <p className="text-lg font-semibold text-stone-800">
                      {formatCurrency(category.targetAmount)}
                    </p>
                  </div>
                )}
              </div>

              {category.targetAmount && (
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <p className="mt-3 text-sm text-stone-500">
                {category.donorCount} generous donor
                {category.donorCount !== 1 ? 's' : ''} contributed
              </p>
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
