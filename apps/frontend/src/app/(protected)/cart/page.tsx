import { getCart } from '@/app/actions/order'
import CartClient from './CartClient'

export const metadata = { title: 'Cart — SnapBite' }

export default async function CartPage() {
  // Rendered on the server, so a failure here would blank the whole page.
  // A plain <a> forces a full navigation, which re-runs this render.
  let cart: Awaited<ReturnType<typeof getCart>>
  try {
    cart = await getCart()
  } catch {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-4xl">⚠️</div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Couldn&apos;t load your cart</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              The server didn&apos;t respond. This can happen on the first visit after a quiet period.
            </p>
          </div>
          <a href="/cart"
            className="mt-2 px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
            Try again
          </a>
        </div>
      </div>
    )
  }

  return <CartClient initialCart={cart} />
}
