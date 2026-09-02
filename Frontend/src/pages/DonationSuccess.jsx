import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getDonationStatus, verifyDonation } from '../services/api';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DonationSuccess() {
  const navigate = useNavigate();
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
        let data;
        try {
          data = await verifyDonation(donationId);
        } catch {
          data = await getDonationStatus(donationId);
        }
        setDonation(data);

        if (data.status === 'FAILED') {
          navigate(`/donation-failed?donation_id=${donationId}`, { replace: true });
          return;
        }

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
  }, [donationId, navigate]);

  const isSuccess = donation?.status === 'COMPLETED';

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <div className="card overflow-hidden p-8 text-center md:p-12">
        {loading && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
            </div>
            <h1 className="font-display mt-6 text-3xl font-bold text-stone-900">
              Confirming your donation...
            </h1>
            <p className="mt-3 text-stone-600">
              Please wait while we verify your payment status.
            </p>
          </>
        )}

        {!loading && isSuccess && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-4xl text-white shadow-lg shadow-brand-500/30">
              ✓
            </div>
            <h1 className="font-display mt-6 text-3xl font-bold text-brand-800 md:text-4xl">
              Thank you for your generosity!
            </h1>
            <p className="mt-3 text-stone-600">
              Your contribution to{' '}
              <span className="font-semibold text-stone-800">{donation.category.name}</span>{' '}
              has been received successfully.
            </p>
            <p className="mt-2 text-sm text-brand-700">
              {donation.certificateSentAt
                ? `Your e-certificate (PDF) has been sent to ${donation.donorEmail}.`
                : 'Your e-certificate will be emailed to you shortly as a PDF attachment.'}
            </p>
            <div className="mt-8 rounded-2xl bg-stone-50 p-6 text-left">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Amount</p>
                  <p className="font-display mt-1 text-3xl font-bold text-brand-700">
                    {formatCurrency(donation.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Donor</p>
                  <p className="mt-1 font-semibold text-stone-800">{donation.donorName}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-stone-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Donation ID</p>
                <p className="mt-1 font-mono text-xs text-stone-600">{donation.id}</p>
              </div>
            </div>
          </>
        )}

        {!loading && !isSuccess && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-3xl">
              ⏳
            </div>
            <h1 className="font-display mt-6 text-3xl font-bold text-stone-900">Donation Status</h1>
            <p className="mt-3 text-stone-600">
              {donationId
                ? 'We could not confirm your payment yet. Please check back shortly.'
                : 'No donation ID provided.'}
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/donations" className="btn-primary">
            Donate Again
          </Link>
          <Link to="/" className="btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
