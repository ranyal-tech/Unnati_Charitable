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

  return (
    <>
      <section className="hero-pattern py-12 text-white md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="section-eyebrow !text-emerald-100">Give Today</p>
          <h1 className="font-display mt-2 text-4xl font-bold md:text-5xl">Make a Donation</h1>
          <p className="mt-4 max-w-2xl text-emerald-50/90">
            This is our dedicated donation page — choose a program and complete your secure
            contribution in a few steps.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-brand-200 bg-brand-50/80 p-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
            1
          </span>
          <div>
            <p className="font-semibold text-brand-900">Select a program</p>
            <p className="mt-0.5 text-sm text-brand-800/80">
              Pick the cause you want to support. You can change your selection anytime before payment.
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card h-80 animate-pulse bg-stone-100" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
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
                  onSelect={setSelectedProgram}
                />
              ))}
            </div>

            {selectedProgram ? (
              <div ref={formRef} className="mt-14 scroll-mt-28">
                <div className="mb-6 flex items-start gap-4 rounded-2xl border border-brand-200 bg-brand-50/80 p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-brand-900">Complete your donation</p>
                    <p className="mt-0.5 text-sm text-brand-800/80">
                      Donating to{' '}
                      <span className="font-semibold">{selectedProgram.name}</span>
                    </p>
                  </div>
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
              <div className="mt-12 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/80 px-6 py-14 text-center">
                <p className="font-display text-xl font-bold text-stone-700">
                  Select a donation program
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  Click on any program above to open the donation form.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
