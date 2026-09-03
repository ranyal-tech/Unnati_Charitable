import { useState } from 'react';
import { createDonationOrder } from '../services/api';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

function getCashfreeMode() {
  return import.meta.env.VITE_CASHFREE_MODE || 'sandbox';
}

function loadCashfreeSdk() {
  if (typeof window.Cashfree !== 'undefined') {
    return Promise.resolve(window.Cashfree);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-cashfree-sdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Cashfree));
      existing.addEventListener('error', () => reject(new Error('Failed to load Cashfree SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.dataset.cashfreeSdk = 'true';
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.body.appendChild(script);
  });
}

export default function DonateForm({
  categorySlug,
  categoryName,
  programs = [],
  onProgramChange,
  embedded = false,
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
        amount: Number(form.amount),
        donorName: form.donorName.trim(),
        donorEmail: form.donorEmail.trim(),
        donorPhone: form.donorPhone.trim(),
        message: form.message.trim(),
      });

      if (!paymentSessionId) {
        throw new Error('Payment session was not created. Please try again.');
      }

      const Cashfree = await loadCashfreeSdk();

      if (typeof Cashfree !== 'function') {
        throw new Error('Cashfree SDK is unavailable. Please refresh and try again.');
      }

      const cashfree = Cashfree({ mode: getCashfreeMode() });

      // Redirect checkout — on success or failure Cashfree returns to our branded status page
      // instead of showing the generic error screen inside a popup modal.
      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to start payment');
    } finally {
      setLoading(false);
    }
  };

  const wrapperClass = embedded
    ? ''
    : 'card overflow-hidden shadow-md shadow-stone-200/60';

  return (
    <form onSubmit={handleSubmit} className={wrapperClass}>
      {!embedded && (
        <div className="bg-gradient-to-r from-brand-700 to-teal-600 px-6 py-5 text-white">
          <h2 className="font-display text-2xl font-bold">Donate to {categoryName}</h2>
          <p className="mt-1 text-sm text-emerald-100">
            Your contribution goes directly to this program.
          </p>
        </div>
      )}

      <div className={embedded ? '' : 'p-6 md:p-7'}>
        {embedded && (
          <p className="mb-5 text-sm text-stone-600">
            Fill in your details below. Payments are secured by Cashfree.
          </p>
        )}

        {programs.length > 0 && (
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">
              Donation Program
            </label>
            <select
              value={categorySlug}
              onChange={(event) => onProgramChange?.(event.target.value)}
              className="input-field"
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
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">Full Name</label>
            <input
              type="text"
              name="donorName"
              value={form.donorName}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">Email</label>
            <input
              type="email"
              name="donorEmail"
              value={form.donorEmail}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">
              Phone <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              type="tel"
              name="donorPhone"
              value={form.donorPhone}
              onChange={handleChange}
              className="input-field"
              placeholder="10-digit mobile number"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">
              Donation Amount (INR)
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, amount }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    form.amount === amount
                      ? 'bg-brand-700 text-white shadow-sm shadow-brand-700/25'
                      : 'bg-stone-100 text-stone-700 hover:bg-brand-50 hover:text-brand-800'
                  }`}
                >
                  ₹{amount.toLocaleString('en-IN')}
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
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">
              Message <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Share a message of support"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-6 w-full !rounded-2xl !py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Redirecting to secure payment...
            </>
          ) : (
            <>Proceed to Secure Payment</>
          )}
        </button>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-400">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Secured by Cashfree Payments
        </p>
      </div>
    </form>
  );
}
