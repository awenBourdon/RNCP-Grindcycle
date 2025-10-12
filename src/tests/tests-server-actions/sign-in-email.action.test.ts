import { describe, it, expect, beforeEach, vi } from 'vitest'
import { signInEmailAction } from '@/actions/auth/sign-in-email.action'

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'x-forwarded-for') return '127.0.0.1'
      return null
    })
  }))
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}))

vi.mock('@/lib/utils/auth', () => ({
  auth: {
    api: {
      signInEmail: vi.fn()
    }
  },
  ErrorCode: {
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED'
  }
}))

vi.mock('@/lib/utils/rateLimit', () => ({
  getClientIP: vi.fn(() => '127.0.0.1'),
  hasExcessiveFailures: vi.fn(() => ({ blocked: false })),
  recordFailedSignIn: vi.fn(),
  resetSignInAttempts: vi.fn()
}))

describe('signInEmailAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('doit connecter un utilisateur avec des identifiants valides', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'ValidPassword123!')

    const result = await signInEmailAction(formData)

    expect(result).toEqual({ error: null })
  })

  it('doit retourner une erreur si email manquant', async () => {
    const formData = new FormData()
    formData.append('email', '')
    formData.append('password', 'ValidPassword123!')

    const result = await signInEmailAction(formData)

    expect(result.error).toBeDefined()
  })

  it('doit bloquer après trop de tentatives échouées', async () => {
    const { hasExcessiveFailures } = await import('@/lib/utils/rateLimit')
    vi.mocked(hasExcessiveFailures).mockReturnValue({
      blocked: true,
      reason: 'Trop de tentatives'
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'wrong')

    const result = await signInEmailAction(formData)

    expect(result.rateLimited).toBe(true)
    expect(result.error).toContain('Trop de tentatives')
  })
})