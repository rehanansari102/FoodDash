import { apiGetNearbyRestaurants } from '@/app/lib/api'

export const metadata = { title: 'Restaurants — FoodDash' }

export default async function RestaurantsPage() {
  // Default to a central location — in production this comes from the user's location
  let restaurants: Awaited<ReturnType<typeof apiGetNearbyRestaurants>> = []
  let error = ''

  try {
    restaurants = await apiGetNearbyRestaurants(40.7128, -74.006, 50)
  } catch {
    error = 'Could not load restaurants.'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Restaurants Near You</h1>
        <p className="text-sm text-gray-500 mt-0.5">Browse and order from the best restaurants around</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-6">{error}</div>
      )}

      {restaurants.length === 0 && !error ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No restaurants found</h2>
          <p className="text-sm text-gray-500">Try expanding your search radius or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {restaurants.map((r) => (
            <a
              key={r._id}
              href={`/restaurants/${r._id}`}
              className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              {r.imageUrl ? (
                <img src={r.imageUrl} alt={r.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-orange-50 flex items-center justify-center">
                  <span className="text-5xl">🍔</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{r.name}</h2>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${r.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {r.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                {r.cuisineTypes?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{r.cuisineTypes.join(' · ')}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{r.address?.city}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <span>⭐ {r.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>Min. ${r.minimumOrder}</span>
                  <span>•</span>
                  <span>Delivery ${r.deliveryFee}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
