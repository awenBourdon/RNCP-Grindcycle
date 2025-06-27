import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductStatus, PointsType, UsedBoardStatus, BoardCondition, BoardType } from '@/generated/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

class ProductController {
  private uploadDir: string

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
  }

  async create(req: NextRequest) {
    try {
      // Utiliser FormData au lieu de JSON
      const formData = await req.formData()
      
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const type = formData.get('type') as string
      const size = parseInt(formData.get('size') as string)
      const priceEuro = parseInt(formData.get('priceEuro') as string)
      const pricePoints = parseInt(formData.get('pricePoints') as string)
      const usedBoardId = formData.get('usedBoardId') as string
      
      // Récupérer les fichiers images
      const images = formData.getAll('images') as File[]
      
      if (!name || !type || !size || !priceEuro || !pricePoints || !usedBoardId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // Traitement des images avec la même logique que UsedBoardController
      const imagePaths = await this.processImages(images)
      const boardType = type as BoardType; 

      const product = await prisma.product.create({
        data: {
          name,
          description,
          type: boardType,
          size,
          priceEuro,
          pricePoints,
          imageUrl: imagePaths,
          usedBoardId,
        },
      })

      return NextResponse.json(product, { status: 201 })
    } catch (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Méthode pour traiter les images (copiée de UsedBoardController)
  private async processImages(images: File[]): Promise<string[]> {
    const imagePaths: string[] = []

    if (!images || images.length === 0) {
      return imagePaths
    }

    await this.ensureUploadDirectoryExists()

    for (const image of images) {
      if (image && image.size > 0) {
        const imagePath = await this.saveImageToServer(image)
        imagePaths.push(imagePath)
      }
    }

    return imagePaths
  }

  // Méthode pour s'assurer que le dossier d'upload existe
  private async ensureUploadDirectoryExists(): Promise<void> {
    try {
      await mkdir(this.uploadDir, { recursive: true })
    } catch (err) {
      console.log('Le dossier existe déjà ou erreur lors de sa création:', err)
    }
  }

  // Méthode pour sauvegarder une image sur le serveur
  private async saveImageToServer(image: File): Promise<string> {
    const timestamp = Date.now()
    const sanitizedName = image.name.replace(/\s+/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    const filepath = path.join(this.uploadDir, filename)

    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    return `/uploads/products/${filename}`
  }

  async getAll() {
    try {
      const products = await prisma.product.findMany()
      return NextResponse.json(products, { status: 200 })
    } catch (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  async purchase(req: NextRequest) {
    try {
      const body = await req.json()
      const { productId, userId } = body

      if (!productId || !userId) {
        return NextResponse.json({ error: 'Product ID and User ID are required' }, { status: 400 })
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      await prisma.$transaction(async (tx) => {
        const usedBoard = await tx.usedBoard.create({
          data: {
            name: product.name,
            user: { connect: { id: userId } },
            status: UsedBoardStatus.RECEIVED,
            boardCondition: BoardCondition.GOOD,
            boardType: product.type,
            image: [],
            pointsAwarded: product.pricePoints,
          },
        })

        await tx.product.update({
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
            pointsAmount: product.pricePoints,
          },
        })
      })

      return NextResponse.json({ message: 'Product purchased successfully' }, { status: 200 })
    } catch (error) {
      console.error('Error during product purchase:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  async delete(req: NextRequest) {
    try {
      const { productId } = await req.json()

      if (!productId) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
      }

      await prisma.product.delete({
        where: { id: productId },
      })

      return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 })
    } catch (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

const controller = new ProductController()

export async function POST(req: NextRequest) {
  return controller.create(req)
}

export async function GET() {
  return controller.getAll()
}

export async function PATCH(req: NextRequest) {
  return controller.purchase(req)
}

export async function DELETE(req: NextRequest) {
  return controller.delete(req)
}