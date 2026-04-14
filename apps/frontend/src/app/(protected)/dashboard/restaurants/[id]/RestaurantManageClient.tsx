'use client'

import { useState, useTransition, useActionState } from 'react'
import type { Restaurant, MenuItem } from '@/app/lib/api'
import { toggleRestaurant, addMenuItem, toggleMenuItem, deleteMenuItem } from '@/app/actions/restaurant'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props {
  restaurant: Restaurant
  initialMenu: MenuItem[]
  token: string
}

export default function RestaurantManageClient({ restaurant: initial, initialMenu }: Props) {
  const [restaurant, setRestaurant] = useState(initial)
  const [menu, setMenu] = useState(initialMenu)
  const [activeTab, setActiveTab] = useState<'overview' | 'menu'>('overview')
  const [isPending, startTransition] = useTransition()
  const [toggleError, setToggleError] = useState('')

  // Add item form state
  const addItemWithId = addMenuItem.bind(null, restaurant._id)
  const [addState, addFormAction, addPending] = useActionState(addItemWithId, undefined)

  function handleToggle() {
    setToggleError('')
    startTransition(async () => {
      const result = await toggleRestaurant(restaurant._id)
      if (result?.success && result.data) {
        setRestaurant(prev => ({ ...prev, isOpen: (result.data as { isOpen: boolean }).isOpen }))
      } else {
        setToggleError(result?.message ?? 'Failed to toggle status')
      }
    })
  }

  function handleToggleItem(restaurantId: string, itemId: string) {
    startTransition(async () => {
      const result = await toggleMenuItem(restaurantId, itemId)
      if (result?.success && result.data) {
        const updated = result.data as { isAvailable: boolean }
        setMenu(prev => prev.map(i => i._id === itemId ? { ...i, isAvailable: updated.isAvailable } : i))
      }
    })
  }

  function handleDeleteItem(restaurantId: string, itemId: string) {
    startTransition(async () => {
      const result = await deleteMenuItem(restaurantId, itemId)
      if (result?.success) {
        setMenu(prev => prev.filter(i => i._id !== itemId))
      }
    })
  }

  // After successful add, merge new item into local state
  if (addState?.success && addState.data) {
    const newItem = addState.data as MenuItem
    if (!menu.find(i => i._id === newItem._id)) {
      setMenu(prev => [...prev, newItem])
    }
  }

  // Group menu by category
  const grouped = menu.reduce<Record<string, MenuItem[]>>((acc, item) => {
    ;(acc[item.category] ??= []).push(item)
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-16 h-16 rounded-2xl object-cover border border-gray-100" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl border border-gray-100">🍔</div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{restaurant.name}</h1>
            <p className="text-sm text-gray-400">{restaurant.address?.city}, {restaurant.address?.country}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {toggleError && <p className="text-xs text-red-600">{toggleError}</p>}
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 disabled:opacity-60 ${
              restaurant.isOpen
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
            {restaurant.isOpen ? 'Open — click to close' : 'Closed — click to open'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Rating', value: `⭐ ${restaurant.rating.toFixed(1)}` },
          { label: 'Reviews', value: restaurant.reviewCount },
          { label: 'Min. order', value: `$${restaurant.minimumOrder}` },
          { label: 'Delivery fee', value: `$${restaurant.deliveryFee}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(['overview', 'menu'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700">{restaurant.description || 'No description set.'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Cuisine</p>
            <div className="flex flex-wrap gap-2">
              {restaurant.cuisineTypes?.length ? restaurant.cuisineTypes.map(c => (
                <span key={c} className="text-xs bg-orange-50 text-orange-700 font-medium px-2.5 py-1 rounded-full">{c}</span>
              )) : <span className="text-sm text-gray-400">None set</span>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Opening Hours</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {restaurant.openingHours?.length ? restaurant.openingHours.map(h => (
                <div key={h.day} className={`text-xs rounded-lg px-3 py-2 ${h.isClosed ? 'bg-gray-50 text-gray-400' : 'bg-green-50 text-green-700'}`}>
                  <span className="font-semibold">{DAYS[h.day]}</span>
                  <span className="block">{h.isClosed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                </div>
              )) : <p className="text-sm text-gray-400 col-span-4">No opening hours set.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Menu tab */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Add item form */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Add Menu Item</h2>
            {addState?.message && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-2">{addState.message}</div>
            )}
            <form action={addFormAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="name" required placeholder="Item name *" className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
              <input name="category" required placeholder="Category * (e.g. Burgers)" className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
              <input name="price" required type="number" min="0" step="0.01" placeholder="Price * (e.g. 9.99)" className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
              <input name="imageUrl" type="url" placeholder="Image URL (https://…)" className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all" />
              <textarea name="description" placeholder="Description (optional)" rows={2} className="sm:col-span-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all resize-none" />
              <button
                type="submit"
                disabled={addPending}
                className="sm:col-span-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-2.5 text-sm shadow-lg shadow-orange-100 transition-all"
              >
                {addPending ? 'Adding…' : '+ Add Item'}
              </button>
            </form>
          </div>

          {/* Menu items */}
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-400 text-sm">No menu items yet. Add your first item above.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{category}</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map(item => (
                    <div key={item._id} className="flex items-center gap-4 px-6 py-4">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl shrink-0">🍽️</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                      </div>
                      <p className="font-bold text-gray-900 text-sm shrink-0">${item.price.toFixed(2)}</p>
                      <button
                        onClick={() => handleToggleItem(restaurant._id, item._id)}
                        disabled={isPending}
                        className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-60 ${
                          item.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(restaurant._id, item._id)}
                        disabled={isPending}
                        className="shrink-0 text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        title="Delete item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
