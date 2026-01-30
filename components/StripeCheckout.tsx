import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

type Props = { amount: number; currency?: string };

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE || '');

const InnerCheckout: React.FC<Props> = ({ amount, currency = 'usd' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return setMessage('Stripe not loaded');
    setLoading(true);
    try {
      const resp = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      const clientSecret = data.clientSecret || data.client_secret || data.client_secret;
      if (!clientSecret) throw new Error('No client secret returned');

      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Card element not found');

      const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
      if (result.error) throw result.error;
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        setMessage('تم الدفع بنجاح');
      } else {
        setMessage('تم إنشاء عملية دفع، تحقق لاحقاً');
      }
    } catch (err: any) {
      setMessage(err?.message || 'خطأ في الدفع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <label className="block text-sm font-bold mb-2">تفاصيل البطاقة</label>
      <div className="p-3 border rounded mb-3">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <div className="flex gap-2">
        <button onClick={handlePay} disabled={!stripe || loading} className="btn-primary px-4 py-2 rounded text-sm">
          {loading ? 'جاري الدفع...' : `ادفع ${amount} ${currency.toUpperCase()}`}
        </button>
      </div>
      {message && <div className="mt-3 text-sm text-center">{message}</div>}
    </div>
  );
};

const StripeCheckout: React.FC<Props> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <InnerCheckout {...props} />
    </Elements>
  );
};

export default StripeCheckout;
