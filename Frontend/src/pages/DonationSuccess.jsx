import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDonationStatus } from '../services/api';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('donation_id');
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!donationId) {
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;

    const pollStatus = async () => {
      try {
        const data = await getDonationStatus(donationId);
        setDonation(data);

        if (data.status === 'PENDING' && attempts < maxAttempts) {
          attempts += 1;
          setTimeout(pollStatus, 2000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    pollStatus();
  }, [donationId]);

  const isSuccess = donation?.status === 'COMPLETED';
  const isFailed = donation?.status === 'FAILED';

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center">
      {loading && (
        <>
          <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-emerald-100" />
          <h1 className="mt-6 text-3xl font-bold text-stone-900">
            Confirming your donation...
          </h1>
          <p className="mt-3 text-stone-600">
            Please wait while we verify your payment status.
          </p>
        </>
      )}

      {!loading && isSuccess && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
            ✓
          </div>
          <h1 className="mt-6 text-3xl font-bold text-emerald-800">
            Thank you for your donation!
          </h1>
          <p className="mt-3 text-stone-600">
            Your generous contribution to{' '}
            <span className="font-semibold">{donation.category.name}</span> has been
            received successfully.
          </p>
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 text-left">
            <p className="text-sm text-stone-500">Donation ID</p>
            <p className="font-mono text-sm">{donation.id}</p>
            <p className="mt-4 text-sm text-stone-500">Amount</p>
            <p className="text-2xl font-bold text-emerald-700">
              {formatCurrency(donation.amount)}
            </p>
            <p className="mt-4 text-sm text-stone-500">Donor</p>
            <p className="font-medium">{donation.donorName}</p>
          </div>
        </>
      )}

      {!loading && isFailed && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
            ✕
          </div>
          <h1 className="mt-6 text-3xl font-bold text-red-700">Payment Failed</h1>
          <p className="mt-3 text-stone-600">
            Your payment could not be completed. Please try again.
          </p>
        </>
      )}

      {!loading && !isSuccess && !isFailed && (
        <>
          <h1 className="text-3xl font-bold text-stone-900">Donation Status</h1>
          <p className="mt-3 text-stone-600">
            {donationId
              ? 'We could not confirm your payment yet. Please check back shortly.'
              : 'No donation ID provided.'}
          </p>
        </>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/donations"
          className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Donate Again
        </Link>
        <Link
          to="/"
          className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
