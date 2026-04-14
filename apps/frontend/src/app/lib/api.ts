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
