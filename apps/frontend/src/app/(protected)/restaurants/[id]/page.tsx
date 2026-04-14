import { notFound } from 'next/navigation'
import Link from 'next/link'
import { apiGetRestaurant, apiGetMenu, type MenuItem } from '@/app/lib/api'

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let restaurant: Awaited<ReturnType<typeof apiGetRestaurant>>
  let menuItems: MenuItem[]

  try {
    ;[restaurant, menuItems] = await Promise.all([apiGetRestaurant(id), apiGetMenu(id)])
  } catch {
    notFound()
  }

  // Group by category
  const grouped = menuItems!.reduce<Record<string, MenuItem[]>>((acc, item) => {
    ;(acc[item.category] ??= []).push(item)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/restaurants" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
        ← All Restaurants
      </Link>

      {/* Hero */}
      <div className="mt-4 rounded-3xl overflow-hidden border border-gray-100">
        {restaurant!.imageUrl ? (
          <img src={restaurant!.imageUrl} alt={restaurant!.name} className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-52 bg-orange-50 flex items-center justify-center text-7xl">🍔</div>
        )}
        <div className="bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{restaurant!.name}</h1>
              {restaurant!.cuisineTypes?.length > 0 && (
                <p className="text-sm text-gray-400 mt-0.5">{restaurant!.cuisineTypes.join(' · ')}</p>
              )}
              {restaurant!.description && (
                <p className="text-sm text-gray-600 mt-2">{restaurant!.description}</p>
              )}
            </div>
            <span className={`shrink-0 text-sm font-semibold px-3 py-1.5 rounded-full ${restaurant!.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {restaurant!.isOpen ? '🟢 Open' : '🔴 Closed'}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
            <span>⭐ {restaurant!.rating.toFixed(1)} ({restaurant!.reviewCount} reviews)</span>
            <span>•</span>
            <span>Min. order ${restaurant!.minimumOrder}</span>
            <span>•</span>
            <span>Delivery ${restaurant!.deliveryFee}</span>
            <span>•</span>
            <span>📍 {restaurant!.address?.city}</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mt-6 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-400">No menu items available yet.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-bold text-gray-800 mb-3">{category}</h2>
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-4 px-5 py-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-2xl shrink-0">🍽️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      {item.description && <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-gray-900">${item.price.toFixed(2)}</p>
                      <button className="mt-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors">
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
