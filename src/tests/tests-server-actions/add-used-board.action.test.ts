/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createUsedBoardAction } from '@/actions/used-boards/add-used-board.action'
import { BoardType, BoardCondition, UserRole } from '@/lib/utils/enums/enums'

const mockCreateUsedBoard = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => {
    const realHeaders = new Headers()
    realHeaders.set('x-forwarded-for', '127.0.0.1')
    return realHeaders
  })
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url) => {
    throw new Error(`REDIRECT: ${url}`)
  })
}))

vi.mock('@/lib/utils/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn()
    }
  }
}))

vi.mock('@/lib/utils/rateLimit', () => ({
  checkRateLimit: vi.fn(() => true),
  getClientIP: vi.fn(() => '127.0.0.1'),
  RATE_LIMIT_MESSAGES: {
    createUsedBoard: 'Trop de planches soumises récemment'
  }
}))

vi.mock('@/lib/validations/boards.validation', () => ({
  usedBoardSchema: {
    safeParse: vi.fn((data) => ({
      success: true,
      data
    }))
  }
}))

vi.mock('@/lib/server/used-boards/used-boards.service', () => ({
  UsedBoardService: vi.fn(() => ({
    createUsedBoard: mockCreateUsedBoard
  }))
}))

describe('createUsedBoardAction - Tests rate limiting', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { checkRateLimit } = await import('@/lib/utils/rateLimit')
    vi.mocked(checkRateLimit).mockReturnValue(true)
    
    const { auth } = await import('@/lib/utils/auth')
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { 
        id: 'user-1', 
        name: 'Test', 
        email: 'test@test.com',
        emailVerified: true,
        role: UserRole.USER,
        banned: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      session: { 
        id: 'session-1',
        token: 'token', 
        userId: 'user-1',
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } as any)
  })

  it('doit créer une planche avec succès', async () => {
    mockCreateUsedBoard.mockResolvedValue({
      id: 'board-1',
      name: 'Ma planche',
      userId: 'user-1'
    })

    const formData = new FormData()
    formData.append('name', 'Ma planche')
    formData.append('userId', 'user-1')
    formData.append('boardType', BoardType.SKATE)
    formData.append('boardCondition', BoardCondition.GOOD)
    formData.append('description', 'Une bonne planche')
    formData.append('image', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))

    const result = await createUsedBoardAction(formData)

    expect(result.success).toBe(true)
    expect(mockCreateUsedBoard).toHaveBeenCalled()
  })

  it('doit bloquer si rate limit atteint', async () => {
    const { checkRateLimit, RATE_LIMIT_MESSAGES } = await import('@/lib/utils/rateLimit')
    vi.mocked(checkRateLimit).mockReturnValue(false)

    const formData = new FormData()
    formData.append('name', 'Ma planche')
    formData.append('userId', 'user-1')
    formData.append('boardType', BoardType.SKATE)
    formData.append('boardCondition', BoardCondition.GOOD)

    const result = await createUsedBoardAction(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe(RATE_LIMIT_MESSAGES.createUsedBoard)
    expect(mockCreateUsedBoard).not.toHaveBeenCalled()
  })

  it('doit rediriger si non connecté', async () => {
    const { auth } = await import('@/lib/utils/auth')
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const formData = new FormData()
    formData.append('name', 'Ma planche')
    formData.append('userId', 'user-1')
    formData.append('boardType', BoardType.SKATE)
    formData.append('boardCondition', BoardCondition.GOOD)

    await expect(createUsedBoardAction(formData)).rejects.toThrow('REDIRECT')
  })

  it('doit empêcher un utilisateur de soumettre pour un autre', async () => {
    const formData = new FormData()
    formData.append('name', 'Ma planche')
    formData.append('userId', 'user-2')
    formData.append('boardType', BoardType.SKATE)
    formData.append('boardCondition', BoardCondition.GOOD)
    formData.append('image', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))

    const result = await createUsedBoardAction(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Non autorisé')
  })
})