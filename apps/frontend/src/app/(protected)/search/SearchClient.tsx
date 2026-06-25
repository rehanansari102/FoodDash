'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Restaurant } from '@/app/lib/api'

const CUISINES = ['Pakistani', 'Italian', 'Chinese', 'Thai', 'Asian', 'Pizza', 'Desi', 'Fast Food', 'Burgers', 'BBQ']
const RATINGS = [{ label: '4.5+', value: 4.5 }, { label: '4.0+', value: 4 }, { label: '3.5+', value: 3.5 }]

interface Props {
  initialResults: Restaurant[]
  query: string
  cuisine: string
  minRating: number
  isOpen: boolean
}

function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <Link href={`/restaurants/${r._id}`} className="block h-full group">
      <div className="rounded-2xl overflow-hidden h-full shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-orange-100 bg-white">
        {r.imageUrl ? (
          <div className="relative w-full h-44 overflow-hidden">
            <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${r.isOpen ? 'bg-green-500/90 text-white' : 'bg-gray-800/70 text-gray-300'}`}>
                {r.isOpen ? '● Open' : '● Closed'}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-44 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5, #fed7aa)' }}>
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🍔</span>
            <div className="absolute bottom-2 left-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.isOpen ? 'bg-green-500/90 text-white' : 'bg-gray-800/70 text-gray-300'}`}>
                {r.isOpen ? '● Open' : '● Closed'}
              </span>
            </div>
          </div>
        )}
        <div className="p-4">
          <h2 className="font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight text-[15px]">{r.name}</h2>
          {r.cuisineTypes?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {r.cuisineTypes.slice(0, 3).map(c => (
                <span key={c} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-100">{c}</span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">📍 {r.address?.city}</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500 flex-wrap">
            {r.rating > 0 && (
              <span className="font-semibold text-amber-500">⭐ {r.rating.toFixed(1)} <span className="text-gray-400 font-normal">({r.reviewCount})</span></span>
            )}
            <span className="text-gray-400">· Min. <span className="font-semibold text-gray-600">₨{r.minimumOrder}</span></span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function SearchClient({ initialResults, query, cuisine, minRating, isOpen }: Props) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(query)

  function buildUrl(overrides: { q?: string; cuisine?: string; minRating?: number; isOpen?: boolean }) {
    const params = new URLSearchParams()
    const q = overrides.q ?? query
    const c = overrides.cuisine !== undefined ? overrides.cuisine : cuisine
    const r = overrides.minRating !== undefined ? overrides.minRating : minRating
    const o = overrides.isOpen !== undefined ? overrides.isOpen : isOpen
    if (q) params.set('q', q)
    if (c) params.set('cuisine', c)
    if (r) params.set('minRating', String(r))
    if (o) params.set('isOpen', 'true')
    return `/search?${params}`
  }

  function toggle(key: 'cuisine' | 'minRating' | 'isOpen', value: string | number | boolean) {
    if (key === 'cuisine') {
      router.push(buildUrl({ cuisine: cuisine === value ? '' : value as string }))
    } else if (key === 'minRating') {
      router.push(buildUrl({ minRating: minRating === value ? 0 : value as number }))
    } else {
      router.push(buildUrl({ isOpen: !isOpen }))
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header + search input */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {query ? `Results for "${query}"` : 'Search Restaurants'}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {initialResults.length} restaurant{initialResults.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault()
          router.push(buildUrl({ q: searchInput.trim() }))
        }}
      >
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            autoFocus
            type="search"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search restaurants, cuisines…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md shadow-orange-200/60 hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
        >
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Open now */}
        <button
          onClick={() => toggle('isOpen', true)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            isOpen
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600'
          }`}
        >
          ● Open Now
        </button>

        {/* Rating chips */}
        {RATINGS.map(r => (
          <button
            key={r.value}
            onClick={() => toggle('minRating', r.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              minRating === r.value
                ? 'bg-amber-400 text-white border-amber-400'
                : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600'
            }`}
          >
            ⭐ {r.label}
          </button>
        ))}

        {/* Cuisine chips */}
        {CUISINES.map(c => (
          <button
            key={c}
            onClick={() => toggle('cuisine', c)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              cuisine.toLowerCase() === c.toLowerCase()
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results */}
      {initialResults.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No restaurants found</h2>
          <p className="text-sm text-gray-500">Try a different search term or remove some filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {initialResults.map(r => (
            <RestaurantCard key={r._id} r={r} />
          ))}
        </div>
      )}
    </div>
  )
}
