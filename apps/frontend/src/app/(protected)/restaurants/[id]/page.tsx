import { notFound } from 'next/navigation'
import Link from 'next/link'
import { apiGetRestaurant, apiGetMenu, apiGetRestaurantReviews, type MenuItem, type Review } from '@/app/lib/api'
import RestaurantMenuClient from './RestaurantMenuClient'
import ReviewsSection from './ReviewsSection'

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let restaurant: Awaited<ReturnType<typeof apiGetRestaurant>>
  let menuItems: MenuItem[]
  let reviews: Review[] = []

  try {
    ;[restaurant, menuItems] = await Promise.all([apiGetRestaurant(id), apiGetMenu(id)])
  } catch {
    notFound()
  }

  try {
    reviews = await apiGetRestaurantReviews(id)
  } catch {
    // Reviews are non-critical — page still renders without them
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/restaurants" className="text-sm text-gray-400 hover:text-orange-500 transition-colors inline-flex items-center gap-1">
        ← All Restaurants
      </Link>

      {/* Hero */}
      <div className="mt-4 rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        {restaurant!.imageUrl ? (
          <img src={restaurant!.imageUrl} alt={restaurant!.name} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 flex items-center justify-center text-7xl" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)' }}>🍔</div>
        )}
        <div className="bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{restaurant!.name}</h1>
              {restaurant!.cuisineTypes?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {restaurant!.cuisineTypes.map(c => (
                    <span key={c} className="text-xs bg-orange-50 text-orange-600 font-semibold px-2.5 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              )}
              {restaurant!.description && (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{restaurant!.description}</p>
              )}
            </div>
            <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${restaurant!.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
              {restaurant!.isOpen ? '● Open' : '● Closed'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
            <span className="flex items-center gap-1">⭐ <strong className="text-gray-800">{restaurant!.rating.toFixed(1)}</strong> ({restaurant!.reviewCount})</span>
            <span className="text-gray-200">|</span>
            <span>Min. ₨{restaurant!.minimumOrder}</span>
            <span className="text-gray-200">|</span>
            <span>Delivery ₨{restaurant!.deliveryFee}</span>
            <span className="text-gray-200">|</span>
            <span>📍 {restaurant!.address?.city}</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mt-6">
        <RestaurantMenuClient
          restaurant={restaurant!}
          menuItems={menuItems!}
        />
      </div>

      {/* Reviews */}
      <ReviewsSection restaurantId={id} initialReviews={reviews} />
    </div>
  )
}
