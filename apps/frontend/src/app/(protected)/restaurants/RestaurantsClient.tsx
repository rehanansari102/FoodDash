'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllRestaurants, getNearbyRestaurants } from '@/app/actions/restaurant'
import { getGoogleNearbyRestaurants, type GooglePlace } from '@/app/actions/places'
import type { Restaurant } from '@/app/lib/api'

type LocationState = 'requesting' | 'granted' | 'denied' | 'unsupported'

// Unified card type — either a SnapBite restaurant or a Google Place
type AnyRestaurant =
  | (Restaurant & { isGooglePlace?: false })
  | GooglePlace

function RestaurantCard({ r, isOwner }: { r: AnyRestaurant; isOwner: boolean }) {
  const isGoogle = 'isGooglePlace' in r && r.isGooglePlace

  const card = (
    <div className="rounded-2xl overflow-hidden group h-full shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-orange-100">
      {r.imageUrl ? (
        <div className="relative w-full h-44 overflow-hidden">
          <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${r.isOpen ? 'bg-green-500/90 text-white' : 'bg-gray-800/70 text-gray-300'}`}>
              {r.isOpen ? '● Open' : '● Closed'}
            </span>
            {isGoogle && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/90 text-white backdrop-blur-sm">Google</span>
            )}
          </div>
        </div>
      ) : (
        <div className="relative w-full h-44 flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5, #fed7aa)' }}>
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🍔</span>
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.isOpen ? 'bg-green-500/90 text-white' : 'bg-gray-800/70 text-gray-300'}`}>
              {r.isOpen ? '● Open' : '● Closed'}
            </span>
          </div>
        </div>
      )}
      <div className="p-4 bg-white">
        <h2 className="font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight text-[15px]">
          {r.name}
        </h2>

        {r.cuisineTypes?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {r.cuisineTypes.slice(0, 3).map(c => (
              <span key={c} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-100">{c}</span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">📍 {r.address?.city}</p>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500 flex-wrap">
          {r.rating > 0 && <span className="font-semibold text-amber-500">⭐ {r.rating.toFixed(1)} {r.reviewCount > 0 && <span className="text-gray-400 font-normal">({r.reviewCount})</span>}</span>}
          {isGoogle && (r as GooglePlace).priceLevel != null && (
            <span className="text-gray-400">· {'₨'.repeat((r as GooglePlace).priceLevel! + 1)}</span>
          )}
          {!isGoogle && (
            <span className="text-gray-400">· Min. <span className="font-semibold text-gray-600">₨{(r as Restaurant).minimumOrder}</span></span>
          )}
        </div>

        {isGoogle && (
          <p className="text-xs mt-2 font-bold text-orange-500">
            {isOwner ? '+ Register on SnapBite →' : 'Not on SnapBite yet'}
          </p>
        )}
      </div>
    </div>
  )

  if (isGoogle) {
    const gp = r as GooglePlace
    if (isOwner) {
      const params = new URLSearchParams({
        source: 'google',
        name: gp.name,
        street: gp.address.street,
        city: gp.address.city,
        country: gp.address.country,
        lat: String(gp.location.lat),
        lng: String(gp.location.lng),
        cuisineTypes: gp.cuisineTypes.join(', '),
        ...(gp.imageUrl ? { imageUrl: gp.imageUrl } : {}),
      })
      return (
        <Link href={`/dashboard/restaurants/new?${params}`} className="block h-full">
          {card}
        </Link>
      )
    }
    // Customers: non-interactive, just informational
    return <div className="h-full cursor-default">{card}</div>
  }

  return (
    <Link href={`/restaurants/${r._id}`} className="block h-full">
      {card}
    </Link>
  )
}

export default function RestaurantsClient({ isOwner }: { isOwner: boolean }) {
  const [snapbiteRestaurants, setSnapbiteRestaurants] = useState<Restaurant[]>([])
  const [googlePlaces, setGooglePlaces] = useState<GooglePlace[]>([])
  const [locationState, setLocationState] = useState<LocationState>('requesting')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationState('unsupported')
      loadAll()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationState('granted')
        setLoading(true)
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          // Fetch SnapBite nearby + Google Places in parallel
          const [snapbite, google] = await Promise.all([
            getNearbyRestaurants(lat, lng, 20),
            getGoogleNearbyRestaurants(lat, lng, 2000),
          ])
          const snapbiteNames = new Set(snapbite.map(r => r.name.toLowerCase()))
          setSnapbiteRestaurants(snapbite)
          setGooglePlaces(google.filter(g => !snapbiteNames.has(g.name.toLowerCase())))
        } catch (err) {
          // If Google fails, still show SnapBite results
          try {
            setSnapbiteRestaurants(await getNearbyRestaurants(lat, lng, 20))
          } catch {
            setError('Could not load restaurants.')
          }
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLocationState('denied')
        loadAll()
      },
      { timeout: 8000 },
    )
  }, [])

  async function loadAll() {
    setLoading(true)
    setGooglePlaces([])
    try {
      setSnapbiteRestaurants(await getAllRestaurants())
    } catch {
      setError('Could not load restaurants.')
    } finally {
      setLoading(false)
    }
  }

  const subtitle =
    locationState === 'granted'
      ? `Showing restaurants near your location`
      : locationState === 'denied' || locationState === 'unsupported'
      ? 'Showing all available restaurants'
      : 'Detecting your location…'

  const snapbiteCount = snapbiteRestaurants.length
  const googleCount = googlePlaces.length
  const hasResults = snapbiteCount > 0 || googleCount > 0

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Restaurants Near You</h1>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        {locationState === 'denied' && (
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-3 py-1.5 rounded-lg border border-orange-200 text-orange-500 hover:bg-orange-50 transition-colors flex-shrink-0">
            📍 Use my location
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 mb-6">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="w-full h-40 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !hasResults && !error ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <div className="text-5xl mb-4">📍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No restaurants near you</h2>
          <p className="text-sm text-gray-500 mb-6">We couldn't find any restaurants within range.</p>
          <button
            onClick={loadAll}
            className="inline-block rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 text-sm shadow-lg shadow-orange-200 transition-all">
            Show all restaurants
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SnapBite restaurants */}
          {snapbiteCount > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                On SnapBite ({snapbiteCount})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {snapbiteRestaurants.map(r => (
                  <RestaurantCard key={r._id} r={r} isOwner={isOwner} />
                ))}
              </div>
            </section>
          )}

          {/* Google Places */}
          {googleCount > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Nearby restaurants ({googleCount})
                </h2>
                <span className="text-[10px] text-gray-400">via Google Maps · click to register on SnapBite</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {googlePlaces.map(r => (
                  <RestaurantCard key={r._id} r={r} isOwner={isOwner} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
