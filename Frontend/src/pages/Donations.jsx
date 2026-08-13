import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import DonateForm from '../components/DonateForm';
import { getCategories } from '../services/api';

export default function Donations() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);

        const preselectedSlug = searchParams.get('program');
        if (preselectedSlug) {
          const match = data.find((item) => item.slug === preselectedSlug);
          if (match) setSelectedProgram(match);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (selectedProgram && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedProgram]);

  const handleSelectProgram = (program) => {
    setSelectedProgram(program);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-stone-900">Make a Donation</h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Choose a donation program below — food support, school supplies,
          orphanage care, or winter essentials — then complete your contribution.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
        <p className="text-sm font-semibold text-emerald-900">Step 1: Select a program</p>
        <p className="mt-1 text-sm text-emerald-800">
          Pick the program you want to support. You can change your selection anytime
          before payment.
        </p>
      </div>

      {loading && (
        <p className="text-stone-500">Loading donation programs...</p>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                selectable
                selected={selectedProgram?.id === category.id}
                onSelect={handleSelectProgram}
              />
            ))}
          </div>

          {selectedProgram ? (
            <div ref={formRef} className="mt-12 scroll-mt-24">
              <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <p className="text-sm font-semibold text-emerald-900">
                  Step 2: Complete your donation
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  You are donating to{' '}
                  <span className="font-semibold">{selectedProgram.name}</span>.
                </p>
              </div>
              <div className="max-w-xl">
                <DonateForm
                  categorySlug={selectedProgram.slug}
                  categoryName={selectedProgram.name}
                  programs={categories}
                  onProgramChange={(nextSlug) => {
                    const match = categories.find((item) => item.slug === nextSlug);
                    if (match) setSelectedProgram(match);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
              <p className="text-lg font-medium text-stone-700">
                Select a donation program to continue
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Click on any program above to open the donation form.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
