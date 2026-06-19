'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { createPaymentIntent, confirmPayment } from '@/app/actions/payment'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1f2937',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
}

function CardForm({ orderId, total }: { orderId: string; total: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    try {
      const { clientSecret, paymentIntentId } = await createPaymentIntent(orderId)

      const card = elements.getElement(CardElement)
      if (!card) throw new Error('Card element not found')

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      })

      if (result.error) {
        setError(result.error.message ?? 'Payment failed')
        return
      }

      await confirmPayment(orderId, paymentIntentId)
      router.push(`/orders/${orderId}?paid=1`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 px-4 py-3.5 bg-white focus-within:border-orange-400 transition-colors">
        <CardElement options={CARD_STYLE} />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        onClick={handlePay}
        disabled={!stripe || loading}
        className="w-full py-3.5 rounded-xl text-white font-black text-base disabled:opacity-50 transition-all hover:scale-[1.01] shadow-lg shadow-green-200/60"
        style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
      >
        {loading ? 'Processing…' : `Pay ₨${total.toFixed(0)} with Card`}
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
        <span>🔒</span> Secured by Stripe · Test card: 4242 4242 4242 4242
      </p>
    </div>
  )
}

export default function PaymentClient({ orderId, total }: { orderId: string; total: number }) {
  return (
    <Elements stripe={stripePromise}>
      <CardForm orderId={orderId} total={total} />
    </Elements>
  )
}
