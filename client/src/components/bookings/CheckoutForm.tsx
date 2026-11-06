import { useState } from 'react';
import type { FormEvent } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Button from '../ui/Button';
import { formatPrice } from '../../utils/booking';

type CheckoutFormProps = {
  total: string;
  onPaid: () => void;
};

export default function CheckoutForm({ total, onPaid }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return; // Stripe.js is still loading

    setSubmitting(true);
    setMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/my-trips` },
      redirect: 'if_required', // only leave the page if the bank requires it
    });

    if (error) {
      setMessage(error.message ?? 'Payment failed. Please try again.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      onPaid();
      return;
    }

    setMessage('The payment was not completed. Please try again.');
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="pay-form">
      <PaymentElement />
      {message && <p role="alert" className="form-error">{message}</p>}
      <Button type="submit" variant="dark" disabled={!stripe || submitting}>
        {submitting ? 'Processing...' : `Pay ${formatPrice(total)}`}
      </Button>
    </form>
  );
}