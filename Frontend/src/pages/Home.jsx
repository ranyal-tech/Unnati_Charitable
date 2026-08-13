import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import DonateForm from '../components/DonateForm';
import { getCategories } from '../services/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handleSelectProgram = (program) => {
    setSelectedProgram(program);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-100">
            Unnati Charitable Trust
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Give hope. Change lives. Support programs that matter.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-emerald-50">
            Select a donation program below and contribute to food, education,
            orphanage care, or winter essentials for those in need.
          </p>
          <div className="mt-6">
            <Link
              to="/about"
              className="inline-flex rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stone-900">Choose a Donation Program</h2>
          <p className="mt-2 max-w-2xl text-stone-600">
            Pick the program you want to support, then fill in your details to donate
            securely through Cashfree.
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
              <div ref={formRef} className="mt-10 scroll-mt-24">
                <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    Complete your donation
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
              <p className="mt-8 text-center text-sm text-stone-400">
                Select a program above to continue
              </p>
            )}
          </>
        )}
      </section>

      <section className="bg-emerald-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          {[
            {
              title: 'Transparent',
              text: 'Track how much has been raised for each program with real-time progress.',
            },
            {
              title: 'Secure Payments',
              text: 'All transactions are processed securely through Cashfree payment gateway.',
            },
            {
              title: 'Direct Impact',
              text: 'Your donation goes directly towards the program you choose to support.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-emerald-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
