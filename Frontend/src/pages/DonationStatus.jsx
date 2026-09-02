import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDonationStatus, verifyDonation } from '../services/api';
import Logo from '../components/Logo';

export default function DonationStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('donation_id');

  useEffect(() => {
    if (!donationId) {
      navigate('/donation-failed', { replace: true });
      return;
    }

    let attempts = 0;
    const maxAttempts = 6;
    let cancelled = false;

    const resolveStatus = async () => {
      try {
        let data;
        try {
          data = await verifyDonation(donationId);
        } catch {
          data = await getDonationStatus(donationId);
        }

        if (cancelled) {
          return;
        }

        if (data.status === 'COMPLETED') {
          navigate(`/donation-success?donation_id=${donationId}`, { replace: true });
          return;
        }

        if (data.status === 'FAILED') {
          navigate(`/donation-failed?donation_id=${donationId}`, { replace: true });
          return;
        }

        if (attempts < maxAttempts) {
          attempts += 1;
          setTimeout(resolveStatus, 2000);
          return;
        }

        navigate(`/donation-failed?donation_id=${donationId}&reason=pending`, {
          replace: true,
        });
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          navigate(`/donation-failed?donation_id=${donationId}&reason=error`, {
            replace: true,
          });
        }
      }
    };

    resolveStatus();

    return () => {
      cancelled = true;
    };
  }, [donationId, navigate]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 md:py-28">
      <div className="card overflow-hidden p-10 text-center md:p-14">
        <Logo size={52} className="mx-auto justify-center" />
        <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        </div>
        <h1 className="font-display mt-6 text-2xl font-bold text-stone-900 md:text-3xl">
          Confirming your payment
        </h1>
        <p className="mx-auto mt-3 max-w-md text-stone-600">
          Please wait while we securely verify your transaction with our payment partner.
        </p>
        <p className="mt-6 text-xs text-stone-400">Do not close or refresh this page.</p>
      </div>
    </section>
  );
}
