'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const GATEWAY = process.env.API_GATEWAY_URL ?? 'http://localhost:3000'

export interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface Cart {
  restaurantId: string
  restaurantName: string
  items: CartItem[]
  subtotal: number
}

async function authHeader() {
  const token = (await cookies()).get('access_token')?.value
  if (!token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${token}` }
}

export async function addToCart(payload: {
  menuItemId: string
  name: string
  price: number
  quantity: number
  restaurantId: string
  restaurantName: string
  imageUrl?: string
}): Promise<{ success: boolean; cart?: Cart; message?: string; conflict?: boolean }> {
  try {
    const headers = await authHeader()
    const res = await fetch(`${GATEWAY}/api/orders/cart/items`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const conflict = res.status === 400 && String(body?.message).includes('another restaurant')
      return { success: false, message: body?.message ?? 'Failed to add item', conflict }
    }
    const cart: Cart = await res.json()
    revalidatePath('/cart')
    return { success: true, cart }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

export async function getCart(): Promise<Cart | null> {
  try {
    const headers = await authHeader()
    const res = await fetch(`${GATEWAY}/api/orders/cart`, {
      method: 'GET',
      headers,
      next: { tags: ['cart'] },
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function removeFromCart(menuItemId: string): Promise<{ success: boolean; cart?: Cart; message?: string }> {
  try {
    const headers = await authHeader()
    const res = await fetch(`${GATEWAY}/api/orders/cart/items/${menuItemId}`, {
      method: 'DELETE',
      headers,
    })
    if (!res.ok) return { success: false, message: 'Failed to remove item' }
    const cart: Cart = await res.json()
    revalidatePath('/cart')
    return { success: true, cart }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

export async function clearCart(): Promise<{ success: boolean }> {
  try {
    const headers = await authHeader()
    await fetch(`${GATEWAY}/api/orders/cart`, { method: 'DELETE', headers })
    revalidatePath('/cart')
    return { success: true }
  } catch { return { success: false } }
}

export async function reorder(items: {
  menuItemId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}[], restaurantId: string, restaurantName: string): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = await authHeader()
    // Clear existing cart first
    await fetch(`${GATEWAY}/api/orders/cart`, { method: 'DELETE', headers })
    // Add each item sequentially
    for (const item of items) {
      const res = await fetch(`${GATEWAY}/api/orders/cart/items`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, restaurantId, restaurantName }),
      })
      if (!res.ok) return { success: false, message: 'Failed to rebuild cart' }
    }
    revalidatePath('/cart')
    return { success: true }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}

export async function updateCartItem(menuItemId: string, quantity: number): Promise<{ success: boolean; cart?: Cart; message?: string }> {
  try {
    const headers = await authHeader()
    const res = await fetch(`${GATEWAY}/api/orders/cart/items/${menuItemId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    if (!res.ok) return { success: false, message: 'Failed to update item' }
    const cart: Cart = await res.json()
    revalidatePath('/cart')
    return { success: true, cart }
  } catch (e) {
    return { success: false, message: (e as Error).message }
  }
}
