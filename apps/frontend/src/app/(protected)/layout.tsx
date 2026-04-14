import { logout } from '@/app/actions/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Double-check on the server — proxy handles redirects but this is the data-layer guard.
  const token = (await cookies()).get('access_token')?.value
  if (!token) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-orange-500">FoodDash</span>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-red-600 transition font-medium"
          >
            Log out
          </button>
        </form>
      </header>
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  )
}
