import { describe, it, expect, beforeEach, vi } from 'vitest'
import { changePasswordAction } from '@/actions/auth/change-password.action'

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => {
    const realHeaders = new Headers()
    realHeaders.set('x-forwarded-for', '127.0.0.1')
    return realHeaders
  })
}))

vi.mock('@/lib/utils/auth', () => ({
  auth: {
    api: {
      changePassword: vi.fn()
    }
  }
}))

vi.mock('@/lib/utils/rateLimit', () => ({
  checkRateLimit: vi.fn(() => true),
  getClientIP: vi.fn(() => '127.0.0.1'),
  RATE_LIMIT_MESSAGES: {
    changePassword: 'Trop de tentatives de changement de mot de passe'
  }
}))
 
vi.mock('@/lib/validations/auth.validation', () => ({
  passwordSchema: {
    parse: vi.fn((value) => {
      if (value.length < 12) throw new Error('Invalid password')
      return value
    })
  }
}))

describe('changePasswordAction - Tests rate limiting', () => {
  beforeEach(async () => {
    vi.clearAllMocks()                                            
    const { checkRateLimit } = await import('@/lib/utils/rateLimit')
    vi.mocked(checkRateLimit).mockReturnValue(true)
  })

  it('doit changer le mot de passe avec succès', async () => {
    const { auth } = await import('@/lib/utils/auth')
    vi.mocked(auth.api.changePassword).mockResolvedValue({} as never)

    const formData = new FormData()
    formData.append('currentPassword', 'OldPassword123!')
    formData.append('newPassword', 'NewPassword123!')

    const result = await changePasswordAction(formData)

    expect(result).toEqual({ error: null })
    expect(auth.api.changePassword).toHaveBeenCalled()
  })

  it('doit bloquer si rate limit atteint', async () => {
    const { checkRateLimit, RATE_LIMIT_MESSAGES } = await import('@/lib/utils/rateLimit')
    vi.mocked(checkRateLimit).mockReturnValue(false)

    const formData = new FormData()
    formData.append('currentPassword', 'OldPassword123!')
    formData.append('newPassword', 'NewPassword123!')

    const result = await changePasswordAction(formData)

    expect(result.error).toBe(RATE_LIMIT_MESSAGES.changePassword)
  })

  it('doit retourner une erreur si currentPassword manquant', async () => {
    const formData = new FormData()
    formData.append('currentPassword', '')
    formData.append('newPassword', 'NewPassword123!')

    const result = await changePasswordAction(formData)

    expect(result.error).toBe('Rentre ton mot de passe actuel')
  })

  it('doit retourner une erreur si newPassword manquant', async () => {
    const formData = new FormData()
    formData.append('currentPassword', 'OldPassword123!')
    formData.append('newPassword', '')

    const result = await changePasswordAction(formData)

    expect(result.error).toBe('Rentre ton nouveau mot de passe')
  })

  it('doit valider le format du nouveau mot de passe', async () => {
    const { passwordSchema } = await import('@/lib/validations/auth.validation')
    vi.mocked(passwordSchema.parse).mockImplementation(() => {
      throw new Error('Invalid password')
    })

    const formData = new FormData()
    formData.append('currentPassword', 'OldPassword123!')
    formData.append('newPassword', 'weak')

    const result = await changePasswordAction(formData)

    expect(result.error).toContain('Le mot de passe doit contenir')
  })
})