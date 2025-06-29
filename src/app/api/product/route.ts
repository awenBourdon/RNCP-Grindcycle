import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductStatus, PointsType, UsedBoardStatus, BoardCondition, BoardType } from '@/generated/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

interface CreateProductData {
  name: string
  description?: string
  type: BoardType
  priceEuro: number
  pricePoints: number
  imageUrl: string[]
  usedBoardId: string
}

interface PurchaseProductData {
  productId: string
  userId: string
}

class ImageService {
  private uploadDir: string

  constructor(subDirectory: string = 'products') {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads', subDirectory)
  }

  async processImages(images: File[]): Promise<string[]> {
    if (!images || images.length === 0) {
      return []
    }

    await this.ensureUploadDirectoryExists()

    const imagePaths: string[] = []
    
    for (const image of images) {
      if (image && image.size > 0) {
        const imagePath = await this.saveImageToServer(image)
        imagePaths.push(imagePath)
      }
    }

    return imagePaths
  }

  private async saveImageToServer(image: File): Promise<string> {
    const timestamp = Date.now()
    const sanitizedName = this.sanitizeFilename(image.name)
    const filename = `${timestamp}_${sanitizedName}`
    const filepath = path.join(this.uploadDir, filename)

    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    return `/uploads/products/${filename}`
  }

  private async ensureUploadDirectoryExists(): Promise<void> {
    try {
      await mkdir(this.uploadDir, { recursive: true })
    } catch (err) {
      console.log('Le dossier existe déjà ou erreur lors de sa création:', err)
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '')
      .toLowerCase()
  }

  validateImages(images: File[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (images.length === 0) {
      errors.push('Au moins une image est requise')
    }

    images.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`Image ${index + 1}: Type de fichier non supporté`)
      }
      if (file.size > maxSize) {
        errors.push(`Image ${index + 1}: Fichier trop volumineux (max 5MB)`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

class ProductService {
  async createProduct(data: CreateProductData) {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        priceEuro: data.priceEuro,
        pricePoints: data.pricePoints,
        imageUrl: data.imageUrl,
        usedBoardId: data.usedBoardId,
      },
    })
  }

  async getAllProducts() {
    return await prisma.product.findMany({
      include: {
        usedBoard: {
          select: {
            id: true,
            name: true,
            boardType: true,
            boardCondition: true,
          }
        }
      }
    })
  }

  async getProductById(productId: string) {
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        usedBoard: true
      }
    })
  }

  async purchaseProduct(data: PurchaseProductData) {
    const { productId, userId } = data

    const product = await this.getProductById(productId)
    if (!product) {
      throw new Error('Produit non trouvé')
    }

    if (product.status === ProductStatus.PURCHASED) {
      throw new Error('Produit déjà acheté')
    }

    return await prisma.$transaction(async (tx) => {
      const usedBoard = await tx.usedBoard.create({
        data: {
          name: product.name,
          user: { connect: { id: userId } },
          status: UsedBoardStatus.RECEIVED,
          boardCondition: BoardCondition.GOOD,
          boardType: product.type,
          image: product.imageUrl,
          pointsAwarded: product.pricePoints,
        },
      })

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          status: ProductStatus.PURCHASED,
          usedBoard: { connect: { id: usedBoard.id } },
        },
      })

      await tx.pointsHistory.create({
        data: {
          user: { connect: { id: userId } },
          usedBoardId: usedBoard.id,
          type: PointsType.PURCHASE,
          pointsAmount: -product.pricePoints,
        },
      })

      return { product: updatedProduct, usedBoard }
    })
  }

  async deleteProduct(productId: string) {
    const product = await this.getProductById(productId)
    if (!product) {
      throw new Error('Produit non trouvé')
    }

    if (product.status === ProductStatus.PURCHASED) {
      throw new Error('Impossible de supprimer un produit acheté')
    }

    return await prisma.product.delete({
      where: { id: productId },
    })
  }

  async getAvailableProducts() {
    return await prisma.product.findMany({
      where: {
        status: ProductStatus.CATALOG
      },
      include: {
        usedBoard: {
          select: {
            id: true,
            name: true,
            boardType: true,
            boardCondition: true,
          }
        }
      }
    })
  }
}

class ProductValidator {
  static validateCreateData(formData: FormData): {
    isValid: boolean
    data?: CreateProductData;
    errors: string[]
  } {
    const errors: string[] = []
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const priceEuro = formData.get('priceEuro') as string
    const pricePoints = formData.get('pricePoints') as string
    const usedBoardId = formData.get('usedBoardId') as string

    if (!name || name.trim() === '') {
      errors.push('Le nom est requis')
    }

    if (!type || !Object.values(BoardType).includes(type as BoardType)) {
      errors.push('Type de planche invalide')
    }

    if (!priceEuro || isNaN(parseInt(priceEuro)) || parseInt(priceEuro) < 0) {
      errors.push('Prix en euros invalide')
    }

    if (!pricePoints || isNaN(parseInt(pricePoints)) || parseInt(pricePoints) < 0) {
      errors.push('Prix en points invalide')
    }

    if (!usedBoardId || usedBoardId.trim() === '') {
      errors.push('ID de la planche d\'occasion requis')
    }

    return {
      isValid: errors.length === 0,
      data: {
        name: name?.trim(),
        description: description?.trim() || undefined,
        type: type as BoardType,
        priceEuro: parseInt(priceEuro),
        pricePoints: parseInt(pricePoints),
        usedBoardId: usedBoardId?.trim(),
        imageUrl: []
      },
      errors
    }
  }

  static validatePurchaseData(body: {
  productId: string;
  userId: string;
}): {
    isValid: boolean
    data?: PurchaseProductData
    errors: string[]
  } {
    const errors: string[] = []

    if (!body.productId || typeof body.productId !== 'string') {
      errors.push('ID du produit requis')
    }

    if (!body.userId || typeof body.userId !== 'string') {
      errors.push('ID de l\'utilisateur requis')
    }

    return {
      isValid: errors.length === 0,
      data: {
        productId: body.productId,
        userId: body.userId
      },
      errors
    }
  }

  static validateDeleteData(body: {
  productId: string;
}): {
    isValid: boolean
    data?: { productId: string }
    errors: string[]
  } {
    const errors: string[] = []

    if (!body.productId || typeof body.productId !== 'string') {
      errors.push('ID du produit requis')
    }

    return {
      isValid: errors.length === 0,
      data: { productId: body.productId },
      errors
    }
  }
}

class ProductController {
  private productService: ProductService
  private imageService: ImageService

  constructor() {
    this.productService = new ProductService()
    this.imageService = new ImageService('products')
  }

  async create(req: NextRequest): Promise<NextResponse> {
    try {
      const formData = await req.formData()
      
      const validation = ProductValidator.validateCreateData(formData)
      if (!validation.isValid) {
        return NextResponse.json({ 
          error: 'Données invalides',
          details: validation.errors 
        }, { status: 400 })
      }

      const images = formData.getAll('images') as File[]
      const imageValidation = this.imageService.validateImages(images)
      
      if (!imageValidation.isValid) {
        return NextResponse.json({ 
          error: 'Erreur de validation des images',
          details: imageValidation.errors 
        }, { status: 400 })
      }

      const imagePaths = await this.imageService.processImages(images)

      const productData: CreateProductData = {
        ...validation.data!,
        imageUrl: imagePaths,
      }

      const product = await this.productService.createProduct(productData)

      return NextResponse.json(product, { status: 201 })
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error)
      return NextResponse.json({ 
        error: 'Erreur interne du serveur' 
      }, { status: 500 })
    }
  }

  async getAll(): Promise<NextResponse> {
    try {
      const products = await this.productService.getAllProducts()
      return NextResponse.json(products, { status: 200 })
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error)
      return NextResponse.json({ 
        error: 'Erreur interne du serveur' 
      }, { status: 500 })
    }
  }

  async getAvailable(): Promise<NextResponse> {
    try {
      const products = await this.productService.getAvailableProducts()
      return NextResponse.json(products, { status: 200 })
    } catch (error) {
      console.error('Erreur lors de la récupération des produits disponibles:', error)
      return NextResponse.json({ 
        error: 'Erreur interne du serveur' 
      }, { status: 500 })
    }
  }

  async purchase(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json()
      const validation = ProductValidator.validatePurchaseData(body)

      if (!validation.isValid) {
        return NextResponse.json({ 
          error: 'Données invalides',
          details: validation.errors 
        }, { status: 400 })
      }

      const result = await this.productService.purchaseProduct(validation.data!)

      return NextResponse.json({ 
        message: 'Produit acheté avec succès',
        data: result
      }, { status: 200 })
    } catch (error) {
      console.error('Erreur lors de l\'achat du produit:', error)
      
      if (error instanceof Error) {
        return NextResponse.json({ 
          error: error.message 
        }, { status: 400 })
      }

      return NextResponse.json({ 
        error: 'Erreur interne du serveur' 
      }, { status: 500 })
    }
  }

  async delete(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json()
      const validation = ProductValidator.validateDeleteData(body)

      if (!validation.isValid) {
        return NextResponse.json({ 
          error: 'Données invalides',
          details: validation.errors 
        }, { status: 400 })
      }

      await this.productService.deleteProduct(validation.data!.productId)

      return NextResponse.json({ 
        message: 'Produit supprimé avec succès' 
      }, { status: 200 })
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error)
      
      if (error instanceof Error) {
        return NextResponse.json({ 
          error: error.message 
        }, { status: 400 })
      }

      return NextResponse.json({ 
        error: 'Erreur interne du serveur' 
      }, { status: 500 })
    }
  }

  async getById(productId: string): Promise<NextResponse> {
    try {
      const product = await this.productService.getProductById(productId)
      
      if (!product) {
        return NextResponse.json({ 
          error: 'Produit non trouvé' 
        }, { status: 404 })
      }

      return NextResponse.json(product, { status: 200 })
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error)
      return NextResponse.json({ 
        error: 'Erreur interne du serveur' 
      }, { status: 500 })
    }
  }
}


const controller = new ProductController()

export async function POST(req: NextRequest) {
  return controller.create(req)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const available = searchParams.get('available')
  const productId = searchParams.get('id')

  if (productId) {
    return controller.getById(productId)
  }

  if (available === 'true') {
    return controller.getAvailable()
  }

  return controller.getAll()
}

export async function PATCH(req: NextRequest) {
  return controller.purchase(req)
}

export async function DELETE(req: NextRequest) {
  return controller.delete(req)
}