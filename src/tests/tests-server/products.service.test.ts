import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProductService } from '../../lib/server/products/products.service'
import { InterfaceProductRepository } from '../../lib/server/products/repository/interface-products.repository'
import { ImageService } from '../../lib/server/upload-images/images.service'
import { ProductStatus } from '@/generated/prisma'
import { 
  mockProduct, 
  mockProductWithoutUsedBoard, 
  mockSoldProduct, 
  mockProducts,
  mockCreateProductData,
  mockImageUploadSuccess,
  mockImageUploadFailure,
  mockFiles 
} from '../mocks/products.mock'

vi.mock('../repository/products.repository')
vi.mock('../../upload-images/images.service')
vi.mock('../../notifications/notifications.service', () => ({
  createNotification: vi.fn(),
  NotificationTemplates: {
    boardRecycled: vi.fn((boardName, productName) => `${boardName} recyclée en ${productName}`)
  }
}))

describe('ProductService', () => {
  let productService: ProductService
  let mockProductRepository: InterfaceProductRepository
  let mockImageService: ImageService

  beforeEach(() => {
    mockProductRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findAllWithPagination: vi.fn(),
      findAvailable: vi.fn(),
      findLatest: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateManyStatus: vi.fn(),
    }

    mockImageService = {
      uploadMultiple: vi.fn(),
      uploadSingle: vi.fn(),
      deleteMultiple: vi.fn(),
      deleteSingle: vi.fn(),
      validate: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    
    productService = new ProductService(mockProductRepository, mockImageService)
    vi.clearAllMocks()
  })

  describe('createProduct', () => {
    it('doit créer un produit', async () => {
      vi.mocked(mockImageService.uploadMultiple).mockResolvedValue(mockImageUploadSuccess)
      vi.mocked(mockProductRepository.create).mockResolvedValue(mockProduct)

      const result = await productService.createProduct(mockCreateProductData, mockFiles)

      expect(result).toEqual(mockProduct)
      expect(mockImageService.uploadMultiple).toHaveBeenCalledWith(mockFiles)
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        ...mockCreateProductData,
        imageUrl: mockImageUploadSuccess.urls,
      })
    })

    it("doit retourner une erreur si l'upload des images échoue", async () => {
      vi.mocked(mockImageService.uploadMultiple).mockResolvedValue(mockImageUploadFailure)

      await expect(productService.createProduct(mockCreateProductData, mockFiles))
        .rejects.toThrow('Erreur upload images: Erreur upload image')
    })

    it("doit retourner une erreur si aucune image n'est uploadée", async () => {
      const emptyUpload = { ...mockImageUploadSuccess, urls: [] }
      vi.mocked(mockImageService.uploadMultiple).mockResolvedValue(emptyUpload)

      await expect(productService.createProduct(mockCreateProductData, mockFiles))
        .rejects.toThrow('Au moins une image est requise')
    })

    it('doit supprimer les images si la création du produit échoue', async () => {
      vi.mocked(mockImageService.uploadMultiple).mockResolvedValue(mockImageUploadSuccess)
      vi.mocked(mockProductRepository.create).mockRejectedValue(new Error('Erreur DB'))
      vi.mocked(mockImageService.deleteMultiple).mockResolvedValue({ deleted: [], failed: [] })

      await expect(productService.createProduct(mockCreateProductData, mockFiles))
        .rejects.toThrow('Erreur DB')

      expect(mockImageService.deleteMultiple).toHaveBeenCalledWith(mockImageUploadSuccess.urls)
    })
  })

  describe('getProductById', () => {
    it('doit retourner un produit par son ID', async () => {
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)

      const result = await productService.getProductById('product-1')

      expect(result).toEqual(mockProduct)
      expect(mockProductRepository.findById).toHaveBeenCalledWith('product-1')
    })

    it("doit retourner une erreur si le produit n'existe pas", async () => {
      vi.mocked(mockProductRepository.findById).mockResolvedValue(null)

      await expect(productService.getProductById('product-inexistant'))
        .rejects.toThrow('Produit non trouvé')
    })

    it("doit retourner une erreur si l'ID est vide", async () => {
      await expect(productService.getProductById(''))
        .rejects.toThrow('ID produit requis')
    })
  })

  describe('getAllProducts', () => {
    it('doit retourner tous les produits sans pagination', async () => {
      vi.mocked(mockProductRepository.findAll).mockResolvedValue(mockProducts)

      const result = await productService.getAllProducts()

      expect(result).toEqual(mockProducts)
      expect(mockProductRepository.findAll).toHaveBeenCalled()
    })
  })

  describe('getAllProductsWithPagination', () => {
    it('doit retourner tous les produits avec pagination', async () => {
      const mockPaginatedResponse = {
        data: [mockProduct, mockProductWithoutUsedBoard],
        meta: {
          currentPage: 1,
          totalPages: 5,
          totalItems: 100,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: false,
        }
      }
      
      vi.mocked(mockProductRepository.findAllWithPagination).mockResolvedValue(mockPaginatedResponse)

      const result = await productService.getAllProductsWithPagination({ page: 1, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockProductRepository.findAllWithPagination).toHaveBeenCalledWith(1, 20)
    })

    it('doit retourner selon les paramètres de pagination', async () => {
      const mockPaginatedResponse = {
        data: mockProducts,
        meta: {
          currentPage: 2,
          totalPages: 5,
          totalItems: 100,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: true,
        }
      }
      
      vi.mocked(mockProductRepository.findAllWithPagination).mockResolvedValue(mockPaginatedResponse)

      const result = await productService.getAllProductsWithPagination({ page: 2, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockProductRepository.findAllWithPagination).toHaveBeenCalledWith(2, 20)
    })
  })

  describe('getAvailableProducts', () => {
    it('doit retourner les produits disponibles avec la pagination', async () => {
      const mockPaginatedResponse = {
        data: [mockProduct, mockProductWithoutUsedBoard],
        meta: {
          currentPage: 1,
          totalPages: 3,
          totalItems: 46,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPreviousPage: false,
        }
      }
      
      vi.mocked(mockProductRepository.findAvailable).mockResolvedValue(mockPaginatedResponse)

      const result = await productService.getAvailableProducts({ page: 1, limit: 20 })

      expect(result).toEqual(mockPaginatedResponse)
      expect(mockProductRepository.findAvailable).toHaveBeenCalledWith(1, 20, {
        minPrice: undefined,
        maxPrice: undefined,
      })
    })
  })

  describe('getLatestProducts', () => {
    it('doit retourner les derniers produits avec limite par défaut', async () => {
      const latestProducts = [mockProduct, mockProductWithoutUsedBoard]
      vi.mocked(mockProductRepository.findLatest).mockResolvedValue(latestProducts)

      const result = await productService.getLatestProducts()

      expect(result).toEqual(latestProducts)
      expect(mockProductRepository.findLatest).toHaveBeenCalledWith(6)
    })

    it('doit retourner les derniers produits avec limite personnalisée', async () => {
      const latestProducts = [mockProduct]
      vi.mocked(mockProductRepository.findLatest).mockResolvedValue(latestProducts)

      const result = await productService.getLatestProducts(3)

      expect(result).toEqual(latestProducts)
      expect(mockProductRepository.findLatest).toHaveBeenCalledWith(3)
    })
  })

  describe('updateProduct', () => {
    it('doit mettre à jour un produit avec succès', async () => {
      const updateData = { name: 'Nouveau nom', priceEuro: 99.99 }
      const updatedProduct = { ...mockProduct, ...updateData }
      
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)
      vi.mocked(mockProductRepository.update).mockResolvedValue(updatedProduct)

      const result = await productService.updateProduct('product-1', updateData)

      expect(result).toEqual(updatedProduct)
      expect(mockProductRepository.update).toHaveBeenCalledWith('product-1', updateData)
    })

    it('doit retourner une erreur si le nom est vide', async () => {
      const updateData = { name: '' }
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)

      await expect(productService.updateProduct('product-1', updateData))
        .rejects.toThrow('Le nom du produit ne peut pas être vide')
    })

    it('doit retourner une erreur si le prix en euros est négatif', async () => {
      const updateData = { priceEuro: -10 }
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)

      await expect(productService.updateProduct('product-1', updateData))
        .rejects.toThrow('Le prix en euros ne peut pas être négatif')
    })

    it('doit retourner une erreur si le prix en points est négatif', async () => {
      const updateData = { pricePoints: -100 }
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)

      await expect(productService.updateProduct('product-1', updateData))
        .rejects.toThrow('Le prix en points ne peut pas être négatif')
    })
  })

  describe('updateProductStatus', () => {
    it("doit mettre à jour le statut d'un produit", async () => {
      const updatedProduct = { ...mockProduct, status: ProductStatus.SOLD }
      
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)
      vi.mocked(mockProductRepository.update).mockResolvedValue(updatedProduct)

      const result = await productService.updateProductStatus('product-1', ProductStatus.SOLD)

      expect(result).toEqual(updatedProduct)
      expect(mockProductRepository.update).toHaveBeenCalledWith('product-1', { status: ProductStatus.SOLD })
    })

    it('doit retourner une erreur pour un statut invalide', async () => {
      await expect(productService.updateProductStatus('product-1', 'INVALID_STATUS' as ProductStatus))
        .rejects.toThrow('Statut de produit invalide')
    })
  })

  describe('deleteProduct', () => {
    it('doit supprimer un produit avec ses images', async () => {
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)
      vi.mocked(mockImageService.deleteMultiple).mockResolvedValue({ deleted: mockProduct.imageUrl, failed: [] })
      vi.mocked(mockProductRepository.delete).mockResolvedValue(undefined)

      await productService.deleteProduct('product-1')

      expect(mockImageService.deleteMultiple).toHaveBeenCalledWith(mockProduct.imageUrl)
      expect(mockProductRepository.delete).toHaveBeenCalledWith('product-1')
    })

    it('doit retourner une erreur si on tente de supprimer un produit vendu', async () => {
      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockSoldProduct)

      await expect(productService.deleteProduct('product-3'))
        .rejects.toThrow('Impossible de supprimer un produit vendu')
    })

    it('doit supprimer même si le produit n\'a pas d\'images', async () => {
      const productWithoutImages = { ...mockProduct, imageUrl: [] }
      vi.mocked(mockProductRepository.findById).mockResolvedValue(productWithoutImages)
      vi.mocked(mockProductRepository.delete).mockResolvedValue(undefined)

      await productService.deleteProduct('product-1')

      expect(mockImageService.deleteMultiple).not.toHaveBeenCalled()
      expect(mockProductRepository.delete).toHaveBeenCalledWith('product-1')
    })
  })

  describe('Validation des données', () => {
    const validationTestCases = [
      { field: 'name', value: ' ', error: 'Le nom du produit ne peut pas être vide' },
      { field: 'priceEuro', value: -1, error: 'Le prix en euros ne peut pas être négatif' },
      { field: 'pricePoints', value: -50, error: 'Le prix en points ne peut pas être négatif' },
    ]

    validationTestCases.forEach(({ field, value, error }) => {
      it(`doit valider le champ ${field}`, async () => {
        const updateData = { [field]: value }
        vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct)

        await expect(productService.updateProduct('product-1', updateData))
          .rejects.toThrow(error)
      })
    })
  })

  describe('Gestion des erreurs', () => {
    it('doit gérer les erreurs de repository', async () => {
      vi.mocked(mockProductRepository.findById).mockRejectedValue(new Error('Erreur DB'))

      await expect(productService.getProductById('product-1'))
        .rejects.toThrow('Erreur DB')
    })

    it("doit gérer les erreurs d'upload d'images", async () => {
      vi.mocked(mockImageService.uploadMultiple).mockRejectedValue(new Error('Erreur upload'))

      await expect(productService.createProduct(mockCreateProductData, mockFiles))
        .rejects.toThrow('Erreur upload')
    })
  })
})