import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { apiGetRestaurant, apiGetMenu } from '@/app/lib/api'
import RestaurantManageClient from './RestaurantManageClient'

export default async function RestaurantManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = (await cookies()).get('access_token')?.value ?? ''

  let restaurant: Awaited<ReturnType<typeof apiGetRestaurant>>
  let menuItems: Awaited<ReturnType<typeof apiGetMenu>>

  try {
    ;[restaurant, menuItems] = await Promise.all([
      apiGetRestaurant(id),
      apiGetMenu(id),
    ])
  } catch {
    notFound()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/restaurants" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
          ← My Restaurants
        </Link>
      </div>
      <RestaurantManageClient restaurant={restaurant!} initialMenu={menuItems!} token={token} />
    </div>
  )
}
