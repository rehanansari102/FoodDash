import Link from 'next/link'
import { getMyOrders } from '@/app/actions/order'
import type { OrderStatus } from '@/app/lib/api'

export const metadata = { title: 'My Orders — SnapBite' }

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready for pickup',
  PICKED_UP: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border border-blue-200',
  PREPARING: 'bg-violet-100 text-violet-700 border border-violet-200',
  READY: 'bg-purple-100 text-purple-700 border border-purple-200',
  PICKED_UP: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border border-red-200',
}

const STATUS_DOT: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-blue-500',
  PREPARING: 'bg-violet-500',
  READY: 'bg-purple-500',
  PICKED_UP: 'bg-indigo-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-400',
}

const STATUS_ICON: Record<OrderStatus, string> = {
  PENDING: '🕐',
  CONFIRMED: '✅',
  PREPARING: '👨‍🍳',
  READY: '📦',
  PICKED_UP: '🛵',
  DELIVERED: '🎉',
  CANCELLED: '❌',
}

export default async function OrdersPage() {
  const orders = await getMyOrders()

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-4xl">🛍️</div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">No orders yet</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">Browse restaurants and place your first order.</p>
          </div>
          <Link href="/restaurants"
            className="mt-2 px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
            Browse Restaurants
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <Link key={order._id} href={`/orders/${order._id}`}
            className="block rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
            {/* Colored top accent bar */}
            <div className={`h-1 w-full ${STATUS_DOT[order.status]}`} />
            <div className="bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{STATUS_ICON[order.status]}</span>
                    <p className="font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors truncate">{order.restaurantName}</p>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                  <p className="font-black text-gray-900">₨{order.total.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
