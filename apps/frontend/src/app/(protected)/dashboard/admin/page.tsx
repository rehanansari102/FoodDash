import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPendingRestaurants } from '@/app/actions/restaurant'
import { getOwnerApplications } from '@/app/actions/auth'
import AdminClient from './AdminClient'

export const metadata = { title: 'Admin — SnapBite' }

export default async function AdminPage() {
  const token = (await cookies()).get('access_token')?.value ?? ''
  let role = ''
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'))
    role = String(payload.role ?? '')
  } catch { /* ignore */ }

  if (role !== 'admin') redirect('/dashboard')

  const [pendingRestaurants, ownerApplications] = await Promise.all([
    getPendingRestaurants(),
    getOwnerApplications(),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Panel</h1>
        <p className="text-sm text-gray-400 mt-1">Manage owner applications and restaurant approvals.</p>
      </div>
      <AdminClient initialPendingRestaurants={pendingRestaurants} initialOwnerApplications={ownerApplications} />
    </div>
  )
}
