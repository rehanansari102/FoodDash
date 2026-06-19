'use server'

import { getAccessToken } from '@/app/lib/cookies'

const GATEWAY = process.env.API_GATEWAY_URL ?? 'http://localhost:3000'

export async function createPaymentIntent(orderId: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const token = await getAccessToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${GATEWAY}/api/orders/${orderId}/payment-intent`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Failed to create payment intent')
  }
  return res.json()
}

export async function confirmPayment(orderId: string, paymentIntentId: string): Promise<{ paymentStatus: string }> {
  const token = await getAccessToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${GATEWAY}/api/orders/${orderId}/payment-confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Failed to confirm payment')
  }
  return res.json()
}
