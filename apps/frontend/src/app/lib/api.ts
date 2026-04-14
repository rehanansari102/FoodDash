import 'server-only'

const GATEWAY = process.env.API_GATEWAY_URL ?? 'http://localhost:3000'

export interface AuthUser {
  id: string
  email: string
  role: string
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

// Helper that forwards httpOnly cookies from the current request to the backend.
// Used so refresh calls carry the refresh_token cookie automatically.
async function gatewayFetch(
  path: string,
  options: RequestInit & { cookies?: string },
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.cookies ? { Cookie: options.cookies } : {}),
  }
  try {
    return await fetch(`${GATEWAY}${path}`, { ...options, headers })
  } catch {
    throw new Error('Unable to reach the server. Please try again later.')
  }
}

export async function apiRegister(email: string, password: string): Promise<AuthResult> {
  const res = await gatewayFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Registration failed')
  }
  return res.json()
}

export async function apiLogin(email: string, password: string): Promise<AuthResult> {
  const res = await gatewayFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Invalid credentials')
  }
  return res.json()
}

// Called with the current refresh_token cookie value so the backend can verify it.
export async function apiRefresh(refreshTokenCookie: string): Promise<AuthResult> {
  const res = await gatewayFetch('/api/auth/refresh', {
    method: 'POST',
    cookies: `refresh_token=${refreshTokenCookie}`,
  })
  if (!res.ok) throw new Error('Session expired')
  return res.json()
}

export async function apiLogout(accessToken: string, refreshTokenCookie: string): Promise<void> {
  await gatewayFetch('/api/auth/logout', {
    method: 'POST',
    cookies: `refresh_token=${refreshTokenCookie}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    } as never,
  })
}

export async function apiForgotPassword(email: string): Promise<void> {
  const res = await gatewayFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Request failed')
  }
}

export async function apiResetPassword(token: string, password: string): Promise<void> {
  const res = await gatewayFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Reset failed')
  }
}

export async function apiVerifyEmail(token: string): Promise<{ success: boolean; message: string; accessToken?: string; refreshToken?: string }> {
  const res = await gatewayFetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  })
  const body = await res.json().catch(() => ({ success: false, message: 'Verification failed' }))
  return body
}

export async function apiResendVerification(accessToken: string): Promise<void> {
  const res = await gatewayFetch('/api/auth/resend-verification', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Failed to resend verification email')
  }
}

// ── Restaurant ────────────────────────────────────────────────────────────────

export interface RestaurantAddress {
  street: string
  city: string
  country: string
}

export interface DayHours {
  day: number
  open: string
  close: string
  isClosed: boolean
}

export interface Restaurant {
  _id: string
  name: string
  description?: string
  cuisineTypes: string[]
  address: RestaurantAddress
  imageUrl?: string
  isOpen: boolean
  isApproved: boolean
  minimumOrder: number
  deliveryFee: number
  openingHours: DayHours[]
  rating: number
  reviewCount: number
  ownerId: string
  createdAt: string
}

export interface CreateRestaurantPayload {
  name: string
  description?: string
  cuisineTypes?: string[]
  address: RestaurantAddress
  lat: number
  lng: number
  imageUrl?: string
  minimumOrder?: number
  deliveryFee?: number
}

export async function apiCreateRestaurant(accessToken: string, payload: CreateRestaurantPayload): Promise<Restaurant> {
  const res = await gatewayFetch('/api/restaurants', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Failed to create restaurant')
  }
  return res.json()
}

export async function apiGetMyRestaurants(accessToken: string): Promise<Restaurant[]> {
  const res = await gatewayFetch('/api/restaurants/my', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
  })
  if (!res.ok) throw new Error('Failed to fetch your restaurants')
  return res.json()
}

export async function apiGetRestaurant(id: string): Promise<Restaurant> {
  const res = await gatewayFetch(`/api/restaurants/${id}`, { method: 'GET' })
  if (!res.ok) throw new Error('Restaurant not found')
  return res.json()
}

export async function apiGetNearbyRestaurants(lat: number, lng: number, radius?: number): Promise<Restaurant[]> {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng), ...(radius ? { radius: String(radius) } : {}) })
  const res = await gatewayFetch(`/api/restaurants/nearby?${params}`, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch restaurants')
  return res.json()
}

export async function apiUpdateRestaurant(accessToken: string, id: string, payload: Partial<CreateRestaurantPayload & { isOpen: boolean }>): Promise<Restaurant> {
  const res = await gatewayFetch(`/api/restaurants/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Failed to update restaurant')
  }
  return res.json()
}

export async function apiToggleRestaurant(accessToken: string, id: string): Promise<{ isOpen: boolean }> {
  const res = await gatewayFetch(`/api/restaurants/${id}/toggle`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
  })
  if (!res.ok) throw new Error('Failed to toggle restaurant status')
  return res.json()
}

export async function apiSetOpeningHours(accessToken: string, id: string, hours: DayHours[]): Promise<Restaurant> {
  const res = await gatewayFetch(`/api/restaurants/${id}/hours`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
    body: JSON.stringify({ hours }),
  })
  if (!res.ok) throw new Error('Failed to save opening hours')
  return res.json()
}

// ── Menu ──────────────────────────────────────────────────────────────────────

export interface MenuItem {
  _id: string
  restaurantId: string
  name: string
  description?: string
  price: number
  category: string
  imageUrl?: string
  isAvailable: boolean
}

export interface CreateMenuItemPayload {
  name: string
  description?: string
  price: number
  category: string
  imageUrl?: string
  isAvailable?: boolean
}

export async function apiGetMenu(restaurantId: string): Promise<MenuItem[]> {
  const res = await gatewayFetch(`/api/menus/${restaurantId}`, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch menu')
  return res.json()
}

export async function apiAddMenuItem(accessToken: string, restaurantId: string, payload: CreateMenuItemPayload): Promise<MenuItem> {
  const res = await gatewayFetch(`/api/menus/${restaurantId}/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? 'Failed to add menu item')
  }
  return res.json()
}

export async function apiUpdateMenuItem(accessToken: string, restaurantId: string, itemId: string, payload: Partial<CreateMenuItemPayload>): Promise<MenuItem> {
  const res = await gatewayFetch(`/api/menus/${restaurantId}/items/${itemId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update menu item')
  return res.json()
}

export async function apiDeleteMenuItem(accessToken: string, restaurantId: string, itemId: string): Promise<void> {
  const res = await gatewayFetch(`/api/menus/${restaurantId}/items/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
  })
  if (!res.ok) throw new Error('Failed to delete menu item')
}

export async function apiToggleMenuItem(accessToken: string, restaurantId: string, itemId: string): Promise<{ isAvailable: boolean }> {
  const res = await gatewayFetch(`/api/menus/${restaurantId}/items/${itemId}/toggle`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` } as never,
  })
  if (!res.ok) throw new Error('Failed to toggle item availability')
  return res.json()
}
