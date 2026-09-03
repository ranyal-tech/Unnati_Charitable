import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DonateForm from '../components/DonateForm';
import ProgramBanner from '../components/ProgramBanner';
import { getCategories, getCategoryBySlug } from '../services/api';

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
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
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
