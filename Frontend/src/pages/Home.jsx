import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import DonateForm from '../components/DonateForm';
import HeroSection from '../components/HeroSection';
import TrustSection from '../components/TrustSection';
import { getCategories } from '../services/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const programsRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedProgram && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedProgram]);

  const totalRaised = categories.reduce((sum, c) => sum + (c.totalRaised || 0), 0);
  const totalDonors = categories.reduce((sum, c) => sum + (c.donorCount || 0), 0);

  const scrollToPrograms = () => {
    programsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <HeroSection
        totalRaised={totalRaised}
        totalDonors={totalDonors}
        programCount={categories.length}
        loading={loading}
        onStartDonating={scrollToPrograms}
      />

      <section id="programs" ref={programsRef} className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="section-eyebrow">Our Programs</p>
          <h2 className="font-display mt-3 text-3xl font-bold text-stone-900 md:text-4xl">
            Choose where your gift goes
          </h2>
          <p className="mt-3 text-stone-600">
            Select a program below, then complete your secure donation through Cashfree.
          </p>
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
                <div className="card mx-auto max-w-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-700 to-teal-600 px-6 py-5 text-white">
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100">
                      Step 2 — Complete your gift
                    </p>
                    <p className="font-display mt-1 text-xl font-bold">
                      Donating to {selectedProgram.name}
                    </p>
                  </div>
                  <div className="p-6">
                    <DonateForm
                      categorySlug={selectedProgram.slug}
                      categoryName={selectedProgram.name}
                      programs={categories}
                      onProgramChange={(nextSlug) => {
                        const match = categories.find((item) => item.slug === nextSlug);
                        if (match) setSelectedProgram(match);
                      }}
                      embedded
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-10 text-center text-sm text-stone-400">
                Tap a program above to open the donation form
              </p>
            )}
          </>
        )}
      </section>

      <TrustSection />

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-8 py-14 text-center md:px-16 md:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)]" />
          <h2 className="font-display relative text-3xl font-bold text-white md:text-4xl">
            Ready to make a difference?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-stone-300">
            Even a small contribution can provide a meal, school supplies, or warmth to someone in need.
          </p>
          <Link
            to="/donations"
            className="btn-primary relative mt-8 !rounded-lg !bg-white !text-brand-900 hover:!bg-stone-100"
          >
            Start Donating
          </Link>
        </div>
      </section>
    </>
  );
}
