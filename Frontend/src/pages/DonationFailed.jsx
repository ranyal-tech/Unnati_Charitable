import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDonationStatus, verifyDonation } from '../services/api';
import Logo from '../components/Logo';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

const REASON_COPY = {
  pending: {
    title: 'Payment could not be confirmed',
    message:
      'We were unable to confirm your payment in time. If money was deducted, it will be refunded automatically within 3–5 business days.',
  },
  error: {
    title: 'Something went wrong',
    message:
      'We could not verify your payment right now. Please check your email or try again in a few minutes.',
  },
  default: {
    title: 'Payment not completed',
    message:
      'Your donation was not processed. No amount has been charged to your account.',
  },
};

export default function DonationFailed() {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('donation_id');
  const reason = searchParams.get('reason') || 'default';
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(Boolean(donationId));

  const copy = REASON_COPY[reason] || REASON_COPY.default;

  useEffect(() => {
    if (!donationId) {
      setLoading(false);
      return;
    }

    verifyDonation(donationId)
      .then(setDonation)
      .catch(() => getDonationStatus(donationId).then(setDonation))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [donationId]);

  const retryHref = donation?.category?.slug
    ? `/donations/${donation.category.slug}`
    : '/donations';

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg shadow-stone-200/50">
        <div className="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-amber-50/60 px-8 py-8 text-center md:px-12">
          <Logo size={48} className="mx-auto justify-center" />
        </div>

        <div className="px-8 py-10 text-center md:px-12 md:py-12">
          {loading ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-stone-200 border-t-stone-600" />
              </div>
              <p className="mt-5 text-stone-600">Loading payment details...</p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10 text-amber-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m0 3.75h.007M10.29 3.86 1.82 18.02A2 2 0 0 0 3.54 21h16.92a2 2 0 0 0 1.72-2.98L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  />
                </svg>
              </div>

              <h1 className="font-display mt-6 text-3xl font-bold text-stone-900 md:text-4xl">
                {copy.title}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-stone-600">
                {copy.message}
              </p>

              {donation && (
                <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Attempted donation
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {donation.category?.name && (
                      <div>
                        <p className="text-xs font-medium text-stone-500">Program</p>
                        <p className="mt-1 font-semibold text-stone-800">
                          {donation.category.name}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-stone-500">Amount</p>
                      <p className="font-display mt-1 text-2xl font-bold text-stone-800">
                        {formatCurrency(donation.amount)}
                      </p>
                    </div>
                  </div>
                  {donationId && (
                    <div className="mt-4 border-t border-stone-200 pt-4">
                      <p className="text-xs font-medium text-stone-500">Reference ID</p>
                      <p className="mt-1 break-all font-mono text-xs text-stone-600">
                        {donationId}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-left">
                <p className="text-sm font-semibold text-blue-900">What you can do next</p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-blue-800/90">
                  <li>• Try the payment again with a different UPI app or card</li>
                  <li>• Check that you have sufficient balance before retrying</li>
                  <li>
                    • If any amount was deducted, it will be auto-refunded within 3–5 business
                    days
                  </li>
                </ul>
              </div>
            </>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to={retryHref} className="btn-primary !px-8">
              Try Donating Again
            </Link>
            <Link to="/" className="btn-outline !px-8">
              Back to Home
            </Link>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-stone-400">
            Need help? Reply to your donation confirmation email or contact us through the About
            page. We're happy to assist.
          </p>
        </div>
      </div>
    </section>
  );
}
