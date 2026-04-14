import 'server-only'
import { cookies } from 'next/headers'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies()

  store.set('access_token', accessToken, {
    ...COOKIE_OPTS,
    // Access token is short-lived — 15 min
    maxAge: 15 * 60,
  })

  store.set('refresh_token', refreshToken, {
    ...COOKIE_OPTS,
    // Refresh token is long-lived — 7 days
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function clearAuthCookies() {
  const store = await cookies()
  store.delete('access_token')
  store.delete('refresh_token')
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get('access_token')?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get('refresh_token')?.value
}
