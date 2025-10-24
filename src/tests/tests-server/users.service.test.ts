import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserService } from '../../lib/server/users/users-service'
import { InterfaceUserRepository } from '../../lib/server/users/repository/interface-users.repository'
import { UserRole } from '@/lib/utils/enums/enums'
import { mockUser, mockAdminUser, mockUserWithLowPoints, mockUsers } from '../mocks/users.mock'

vi.mock('../repository/users.repository')

describe('UserService', () => {
  let userService: UserService
  let mockUserRepository: InterfaceUserRepository

  beforeEach(() => {
    mockUserRepository = {
      findAll: vi.fn(),
      findAllWithPagination: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      update: vi.fn(),
      updateRole: vi.fn(),
      updatePoints: vi.fn(),
      updatePointsInTransaction: vi.fn(),
      deleteWithRelationsCleanup: vi.fn(),
    }
    
    userService = new UserService(mockUserRepository)
    vi.clearAllMocks()
  })

  describe('getUserById', () => {
    it('doit retourner un utilisateur', async () => {

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)

      const result = await userService.getUserById('user-1')

      expect(result).toEqual(mockUser)
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1')
    })

    it("doit retourner une erreur quand l'utilisateur n'existe pas", async () => {

      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(userService.getUserById('user-inexistant'))
        .rejects.toThrow('Utilisateur non trouvé')
    })

    it("doit retourner une erreur quand l'ID est vide", async () => {

      await expect(userService.getUserById(''))
        .rejects.toThrow('ID utilisateur requis')
    })
  })

  describe('getUserByEmail', () => {
    it('doit retourner un utilisateur par email', async () => {

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser)

      const result = await userService.getUserByEmail('john@example.com')

      expect(result).toEqual(mockUser)
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com')
    })

    it("doit retourner une erreur quand l'email n'existe pas", async () => {

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null)

      await expect(userService.getUserByEmail('inexistant@example.com'))
        .rejects.toThrow('Utilisateur non trouvé')
    })

    it("doit retourner une erreur quand l'email est vide", async () => {

      await expect(userService.getUserByEmail(''))
        .rejects.toThrow('Email requis')
    })
  })

  describe('getAllUsers', () => {
    it('doit retourner tous les utilisateurs', async () => {

      vi.mocked(mockUserRepository.findAll).mockResolvedValue(mockUsers)

      const result = await userService.getAllUsers()

      expect(result).toEqual(mockUsers)
      expect(mockUserRepository.findAll).toHaveBeenCalled()
    })

    it("doit retourner un tableau vide quand il n'y a pas d'utilisateurs", async () => {

      vi.mocked(mockUserRepository.findAll).mockResolvedValue([])

      const result = await userService.getAllUsers()

      expect(result).toEqual([])
    })
  })

  describe('updateUserRole', () => {
    it('doit mettre à jour le rôle de USER à ADMIN', async () => {

      const updatedUser = { ...mockUser, role: UserRole.ADMIN }
      
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.updateRole).mockResolvedValue(updatedUser)

      const result = await userService.updateUserRole('user-1', UserRole.ADMIN)

      expect(result).toEqual(updatedUser)
      expect(mockUserRepository.updateRole).toHaveBeenCalledWith('user-1', UserRole.ADMIN)
    })

    it('doit mettre à jour le rôle de ADMIN à USER', async () => {

      const updatedUser = { ...mockAdminUser, role: UserRole.USER }
      
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockAdminUser)
      vi.mocked(mockUserRepository.updateRole).mockResolvedValue(updatedUser)

      const result = await userService.updateUserRole('admin-1', UserRole.USER)

      expect(result).toEqual(updatedUser)
      expect(mockUserRepository.updateRole).toHaveBeenCalledWith('admin-1', UserRole.USER)
    })

    it("doit retourner une erreur si l'utilisateur n'existe pas", async () => {

      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(userService.updateUserRole('user-inexistant', UserRole.ADMIN))
        .rejects.toThrow('Utilisateur non trouvé')
    })

    it("doit retourner une erreur si l'ID est vide", async () => {

      await expect(userService.updateUserRole('', UserRole.ADMIN))
        .rejects.toThrow('ID utilisateur requis')
    })

    it("doit retourner une erreur si le rôle est invalide", async () => {

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(userService.updateUserRole('user-1', 'INVALID_ROLE' as any))
        .rejects.toThrow('Rôle invalide')
    })
  })

  describe('updateUserProfile', () => {
    it('doit mettre à jour le profil utilisateur avec succès', async () => {

      const updateData = { name: 'Jane Doe' }
      const updatedUser = { ...mockUser, name: 'Jane Doe' }
      
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null)
      vi.mocked(mockUserRepository.update).mockResolvedValue(updatedUser)

      const result = await userService.updateUserProfile('user-1', updateData)

      expect(result).toEqual(updatedUser)
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', updateData)
    })

    it("doit mettre à jour l'email si celui-ci n'est pas pris", async () => {

      const updateData = { email: 'newemail@example.com' }
      const updatedUser = { ...mockUser, email: 'newemail@example.com' }
      
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null)
      vi.mocked(mockUserRepository.update).mockResolvedValue(updatedUser)

      const result = await userService.updateUserProfile('user-1', updateData)

      expect(result).toEqual(updatedUser)
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('newemail@example.com')
    })

    it("doit retourner une erreur si l'email est déjà utilisé par un autre utilisateur", async () => {

      const updateData = { email: 'admin@example.com' }
      
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockAdminUser)

      await expect(userService.updateUserProfile('user-1', updateData))
        .rejects.toThrow('Cette adresse email est déjà utilisée')
    })

    it('doit permettre de garder le même email', async () => {

      const updateData = { email: 'john@example.com', name: 'John Updated' }
      const updatedUser = { ...mockUser, name: 'John Updated' }
      
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.update).mockResolvedValue(updatedUser)

      const result = await userService.updateUserProfile('user-1', updateData)

      expect(result).toEqual(updatedUser)
    })

    it('doit retourner une erreur si le nom est vide', async () => {

      const updateData = { name: '' }
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)


      await expect(userService.updateUserProfile('user-1', updateData))
        .rejects.toThrow('Le nom ne peut pas être vide')
    })

    it('doit retourner une erreur si le nom est trop long', async () => {

      const updateData = { name: 'a'.repeat(101) }
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)

      await expect(userService.updateUserProfile('user-1', updateData))
        .rejects.toThrow('Le nom ne peut pas dépasser 100 caractères')
    })

    it("doit retourner une erreur si l'email a un format invalide", async () => {

      const updateData = { email: 'email-invalide' }
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)

      await expect(userService.updateUserProfile('user-1', updateData))
        .rejects.toThrow('Format d\'email invalide')
    })
  })

  describe('updateUserPoints', () => {
    it('doit ajouter des points avec succès', async () => {

      const updatedUser = { ...mockUser, points: 200 }
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.updatePoints).mockResolvedValue(updatedUser)

      const result = await userService.updateUserPoints('user-1', 50)

      expect(result).toEqual(updatedUser)
      expect(mockUserRepository.updatePoints).toHaveBeenCalledWith('user-1', 50)
    })

    it('doit retirer des points avec succès', async () => {

      const updatedUser = { ...mockUser, points: 100 }
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.updatePoints).mockResolvedValue(updatedUser)

      const result = await userService.updateUserPoints('user-1', -50)

      expect(result).toEqual(updatedUser)
      expect(mockUserRepository.updatePoints).toHaveBeenCalledWith('user-1', -50)
    })

    it('doit retourner une erreur si le solde devient négatif', async () => {

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUserWithLowPoints)

      await expect(userService.updateUserPoints('user-2', -50))
        .rejects.toThrow('Solde de points insuffisant')
    })

    it('doit retourner une erreur si les points ne sont pas un number', async () => {

      await expect(userService.updateUserPoints('user-1', NaN))
        .rejects.toThrow('Différence de points invalide')
    })

    it('doit permettre d\'avoir exactement 0 points', async () => {

      const userWith100Points = { ...mockUser, points: 100 }
      const userWith0Points = { ...mockUser, points: 0 }
      
      vi.mocked(mockUserRepository.findById).mockResolvedValue(userWith100Points)
      vi.mocked(mockUserRepository.updatePoints).mockResolvedValue(userWith0Points)

      const result = await userService.updateUserPoints('user-1', -100)

      expect(result).toEqual(userWith0Points)
    })
  })

  describe('getUserPoints', () => {
    it("doit retourner le nombre de points de l'utilisateur", async () => {

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)

      const result = await userService.getUserPoints('user-1')

      expect(result).toBe(150)
    })

    it("doit retourner une erreur si l'utilisateur n'existe pas", async () => {

      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(userService.getUserPoints('user-inexistant'))
        .rejects.toThrow('Utilisateur non trouvé')
    })
  })

  describe('deleteUser', () => {
    it('doit supprimer un utilisateur avec succès', async () => {

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.deleteWithRelationsCleanup).mockResolvedValue(undefined)

      await userService.deleteUser('user-1')

      expect(mockUserRepository.deleteWithRelationsCleanup).toHaveBeenCalledWith('user-1')
    })

    it("doit retourner une erreur si l'utilisateur n'existe pas", async () => {

      vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

      await expect(userService.deleteUser('user-inexistant'))
        .rejects.toThrow('Utilisateur non trouvé')
    })

    it("doit retourner une erreur si l'ID est vide", async () => {
 
      await expect(userService.deleteUser(''))
        .rejects.toThrow('ID utilisateur requis')
    })
  })

  describe("Validation d'email", () => {
    const validEmails = [
      'user@example.com',
      'test.email@domain.co.uk',
      'user+tag@example.org',
      '123@test.com'
    ]

    const invalidEmails = [
      'email-sans-arobase',
      '@domain.com',
      'user@',
      'user@@domain.com',
      'user@domain',
      'user@domain.',
      ''
    ]

    validEmails.forEach(email => {
      it(`doit accepter l'email valide: ${email}`, async () => {

        const updateData = { email }
        vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null)
        vi.mocked(mockUserRepository.update).mockResolvedValue({ ...mockUser, email })

        await expect(userService.updateUserProfile('user-1', updateData))
          .resolves.toBeDefined()
      })
    })

    invalidEmails.forEach(email => {
      it(`doit rejeter l'email invalide: ${email}`, async () => {

        const updateData = { email }
        vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser)

        await expect(userService.updateUserProfile('user-1', updateData))
          .rejects.toThrow('Format d\'email invalide')
      })
    })
  })
})