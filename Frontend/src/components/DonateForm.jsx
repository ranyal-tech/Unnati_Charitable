import { useState } from 'react';
import { createDonationOrder } from '../services/api';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

export default function DonateForm({
  categorySlug,
  categoryName,
  programs = [],
  onProgramChange,
}) {
  const [form, setForm] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: 500,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { paymentSessionId } = await createDonationOrder({
        categorySlug,
        amount: form.amount,
        donorName: form.donorName,
        donorEmail: form.donorEmail,
        donorPhone: form.donorPhone,
        message: form.message,
      });

      const cashfreeMode = import.meta.env.VITE_CASHFREE_MODE || 'sandbox';

      if (typeof window.Cashfree === 'undefined') {
        throw new Error('Cashfree SDK failed to load. Please refresh and try again.');
      }

      const cashfree = window.Cashfree({ mode: cashfreeMode });
      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
      });
    } catch (err) {
      setError(err.message || 'Failed to start payment');
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-stone-900">Donate to {categoryName}</h2>
      <p className="mt-2 text-sm text-stone-600">
        Your contribution will go directly towards this program.
      </p>

      {programs.length > 0 && (
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Donation Program
          </label>
          <select
            value={categorySlug}
            onChange={(event) => onProgramChange?.(event.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600"
          >
            {programs.map((program) => (
              <option key={program.slug} value={program.slug}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Full Name
          </label>
          <input
            type="text"
            name="donorName"
            value={form.donorName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            type="email"
            name="donorEmail"
            value={form.donorEmail}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Phone (optional)
          </label>
          <input
            type="tel"
            name="donorPhone"
            value={form.donorPhone}
            onChange={handleChange}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600"
            placeholder="10-digit mobile number"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            Donation Amount (INR)
          </label>
          <div className="mb-3 flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, amount }))}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  form.amount === amount
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>
          <input
            type="number"
            name="amount"
            min="1"
            value={form.amount}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Message (optional)
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600"
            placeholder="Share a message of support"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Redirecting to payment...' : 'Proceed to Pay with Cashfree'}
      </button>
    </form>
  );
}
