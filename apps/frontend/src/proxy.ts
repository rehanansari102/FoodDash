import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard']
const PUBLIC_AUTH = ['/login', '/register']
const GATEWAY = process.env.API_GATEWAY_URL ?? 'http://localhost:3000'

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + '/'))
  const isPublicAuth = PUBLIC_AUTH.some((p) => path === p)

  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value

  // Determine if the user has a valid session.
  // We treat the presence of access_token as "authenticated" for the optimistic check.
  // If access_token is absent but refresh_token exists, attempt a silent refresh.
  let authenticated = !!accessToken

  if (!authenticated && refreshToken) {
    // Call the gateway refresh endpoint, forwarding the refresh_token cookie
    try {
      const res = await fetch(`${GATEWAY}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refresh_token=${refreshToken}`,
        },
      })

      if (res.ok) {
        const data = (await res.json()) as { accessToken: string; refreshToken: string }

        // Continue to the requested route and write the new cookies onto the response
        const response = isPublicAuth
          ? NextResponse.redirect(new URL('/dashboard', req.nextUrl))
          : NextResponse.next()

        const cookieOpts = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
        }
        response.cookies.set('access_token', data.accessToken, {
          ...cookieOpts,
          maxAge: 15 * 60,
        })
        response.cookies.set('refresh_token', data.refreshToken, {
          ...cookieOpts,
          maxAge: 7 * 24 * 60 * 60,
        })
        return response
      }
    } catch {
      // Refresh failed — fall through as unauthenticated
    }
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !authenticated) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', path)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login/register
  if (isPublicAuth && authenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
