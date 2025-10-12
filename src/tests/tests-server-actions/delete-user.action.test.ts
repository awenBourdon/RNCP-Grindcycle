/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { deleteUserAction } from '@/actions/auth/delete-user.action'
import { UserRole } from '@/lib/utils/enums/enums'

const mockGetUserById = vi.fn()
const mockDeleteUser = vi.fn()

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn()
  }))
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

vi.mock('@/lib/utils/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      signOut: vi.fn()
    }
  }
}))

vi.mock('@/lib/validations/auth.validation', () => ({
  deleteUserSchema: {
    safeParse: vi.fn((data) => ({
      success: true,
      data
    }))
  }
}))

vi.mock('@/lib/server/users/users-service', () => ({
  UserService: vi.fn(() => ({
    getUserById: mockGetUserById,
    deleteUser: mockDeleteUser
  }))
}))

describe('deleteUserAction - Tests autorisations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserById.mockReset()
    mockDeleteUser.mockReset()
  })

  it('doit permettre à un utilisateur de supprimer son propre compte', async () => {
    const { auth } = await import('@/lib/utils/auth')
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', role: UserRole.USER },
      session: {}
    } as any)
    
    mockDeleteUser.mockResolvedValue(undefined)

    const result = await deleteUserAction({ userId: 'user-1' })

    expect(result.success).toBe(true)
    expect(result.shouldRedirect).toBe(true)
    expect(auth.api.signOut).toHaveBeenCalled()
  })

  it('doit permettre à un admin de supprimer un utilisateur normal', async () => {
    const { auth } = await import('@/lib/utils/auth')
    
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'admin-1', role: UserRole.ADMIN },
      session: {}
    } as any)

    mockGetUserById.mockResolvedValue({
      id: 'user-2',
      name: 'User 2',
      email: 'user2@test.com',
      role: UserRole.USER,
      emailVerified: true,
      image: [],
      points: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    })

    mockDeleteUser.mockResolvedValue(undefined)

    const result = await deleteUserAction({ userId: 'user-2' })

    expect(result.success).toBe(true)
    expect(mockDeleteUser).toHaveBeenCalledWith('user-2')
  })

  it('doit empêcher un admin de supprimer un autre admin', async () => {
    const { auth } = await import('@/lib/utils/auth')
    
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'admin-1', role: UserRole.ADMIN },
      session: {}
    } as any)

    mockGetUserById.mockResolvedValue({
      id: 'admin-2',
      name: 'Admin 2',
      email: 'admin2@test.com',
      role: UserRole.ADMIN,
      emailVerified: true,
      image: [],
      points: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    })

    const result = await deleteUserAction({ userId: 'admin-2' })

    expect(result.success).toBe(false)
    expect(result.error).toContain('administrateur')
  })

  it('doit empêcher un utilisateur de supprimer le compte d\'un autre', async () => {
    const { auth } = await import('@/lib/utils/auth')
    
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user-1', role: UserRole.USER },
      session: {}
    } as any)

    const result = await deleteUserAction({ userId: 'user-2' })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Non autorisé')
  })

  it('doit retourner une erreur si non connecté', async () => {
    const { auth } = await import('@/lib/utils/auth')
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const result = await deleteUserAction({ userId: 'user-1' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Non autorisé')
  })
})