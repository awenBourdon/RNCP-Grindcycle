/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { favoritesAction } from '@/actions/favorites/favorite.action'
import { UserRole } from '@/lib/utils/enums/enums'

const mockToggleFavorite = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers())
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

vi.mock('@/lib/utils/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn()
    }
  }
}))

vi.mock('@/lib/server/favorites/favorites.service', () => ({
  FavoriteService: vi.fn(() => ({
    toggleFavorite: mockToggleFavorite
  }))
}))

describe('favoritesAction - Tests autorisations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('doit ajouter un produit aux favoris', async () => {
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

    mockToggleFavorite.mockResolvedValue({
      action: 'added',
      message: 'Ajouté aux favoris'
    })

    const result = await favoritesAction('product-1')

    expect(result.success).toBe(true)
    expect(result.action).toBe('added')
    expect(mockToggleFavorite).toHaveBeenCalledWith('user-1', 'product-1')
  })

  it('doit retirer un produit des favoris', async () => {
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

    mockToggleFavorite.mockResolvedValue({
      action: 'removed',
      message: 'Retiré des favoris'
    })

    const result = await favoritesAction('product-1')

    expect(result.success).toBe(true)
    expect(result.action).toBe('removed')
  })

  it('doit retourner une erreur si non connecté', async () => {
    const { auth } = await import('@/lib/utils/auth')
    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    const result = await favoritesAction('product-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Non connecté')
    expect(mockToggleFavorite).not.toHaveBeenCalled()
  })

  it('doit valider l\'ID produit', async () => {
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

    const result = await favoritesAction('')

    expect(result.success).toBe(false)
    expect(result.error).toBe('ID produit invalide')
    expect(mockToggleFavorite).not.toHaveBeenCalled()
  })
})