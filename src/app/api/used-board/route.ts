import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, unlink } from 'fs/promises'
import { mkdir } from 'fs/promises'
import path from 'path'
import { BoardCondition, UsedBoardStatus, PointsType } from '@/generated/prisma'

class UsedBoardController {
  private uploadDir: string

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads', 'boards')
  }

  async create(req: NextRequest) {
    try {
      const contentType = req.headers.get('content-type') || ''

      if (contentType.includes('multipart/form-data')) {
        return await this.handleFormDataRequest(req)
      } else {
        return await this.handleJsonRequest(req)
      }
    } catch (error) {
      console.error('Erreur API /used-board:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
  }

 async update(req: NextRequest) {
  try {
    const body = await req.json()
    const { boardId, status, pointsAwarded } = body

    if (!boardId) {
      return NextResponse.json({ error: 'ID de planche manquant' }, { status: 400 })
    }

    if (pointsAwarded !== undefined && (typeof pointsAwarded !== 'number' || pointsAwarded < 0)) {
      return NextResponse.json({ error: 'Points attribués invalides' }, { status: 400 })
    }

    const oldBoard = await prisma.usedBoard.findUnique({
      where: { id: boardId },
      include: { user: true },
    })

    if (!oldBoard) {
      return NextResponse.json({ error: 'Planche non trouvée' }, { status: 404 })
    }

    // TODO : typer correctement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}

    if (status !== undefined) {
      if (!Object.values(UsedBoardStatus).includes(status)) {
        return NextResponse.json({ error: 'Statut de planche invalide' }, { status: 400 })
      }

      updateData.status = status

      if (status !== 'RECEIVED') {
        updateData.pointsAwarded = null
      }
    }

    if (pointsAwarded !== undefined && (status === 'RECEIVED' || oldBoard.status === 'RECEIVED')) {
      updateData.pointsAwarded = pointsAwarded
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedBoard = await tx.usedBoard.update({
        where: { id: boardId },
        data: updateData,
        include: { user: true },
      })

      if (
        oldBoard.pointsAwarded &&
        oldBoard.pointsAwarded > 0 &&
        oldBoard.status === 'RECEIVED'
      ) {
        await tx.pointsHistory.deleteMany({
          where: {
            userId: updatedBoard.userId,
            usedBoardId: boardId,
            type: 'RECYCLING',
          },
        })
      }

      if (
        updatedBoard.pointsAwarded &&
        updatedBoard.pointsAwarded > 0 &&
        updatedBoard.status === 'RECEIVED'
      ) {
        await tx.pointsHistory.create({
          data: {
            userId: updatedBoard.userId,
            usedBoardId: boardId,
            type: PointsType.RECYCLING,
            pointsAmount: updatedBoard.pointsAwarded,
          },
        })
      }

      const totalPoints = await tx.pointsHistory.aggregate({
        where: { userId: updatedBoard.userId },
        _sum: { pointsAmount: true },
      })

      await tx.user.update({
        where: { id: updatedBoard.userId },
        data: {
          points: totalPoints._sum.pointsAmount ?? 0,
        },
      })

      return updatedBoard
    })

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la planche:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


  private async handleFormDataRequest(req: NextRequest) {
    const formData = await req.formData()

    const userId = formData.get('userId') as string
    const boardCondition = formData.get('boardCondition') as string
    const description = formData.get('description') as string | null

    if (!this.validateRequiredFields(userId, boardCondition)) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    const images = formData.getAll('image') as File[]
    const imagePaths = await this.processImages(images)

    const board = await this.createBoardInDatabase({
      userId,
      boardCondition,
      description,
      imagePaths,
    })

    return NextResponse.json(board, { status: 201 })
  }

  private async handleJsonRequest(req: NextRequest) {
    const body = await req.json()
    const { userId, boardCondition, description, image } = body

    if (!this.validateRequiredFields(userId, boardCondition)) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    const board = await this.createBoardInDatabase({
      userId,
      boardCondition,
      description,
      imagePaths: image || [],
    })

    return NextResponse.json(board, { status: 201 })
  }

  private validateRequiredFields(
    userId: string,
    boardCondition: string
  ): boolean {
    return !!(userId && boardCondition)
  }

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

  private async ensureUploadDirectoryExists(): Promise<void> {
    try {
      await mkdir(this.uploadDir, { recursive: true })
    } catch (err) {
      console.log('Le dossier existe déjà ou erreur lors de sa création:', err)
    }
  }

  private async saveImageToServer(image: File): Promise<string> {
    const timestamp = Date.now()
    const sanitizedName = image.name.replace(/\s+/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    const filepath = path.join(this.uploadDir, filename)

    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    return `/uploads/boards/${filename}`
  }

  private async createBoardInDatabase(data: {
    userId: string
    boardCondition: string
    description: string | null
    imagePaths: string[]
  }) {
    console.log('Board condition reçue :', data.boardCondition)
    if (!['GOOD', 'AVERAGE', 'BAD'].includes(data.boardCondition)) {
      throw new Error('Erreur type de planche')
    }

    return await prisma.usedBoard.create({
      data: {
        userId: data.userId,
        boardCondition: data.boardCondition as BoardCondition,
        description: data.description || null,
        image: data.imagePaths,
      },
    })
  }

  async deleteBoard(boardId: string) {
    try {
      const board = await prisma.usedBoard.findUnique({
        where: {
          id: boardId,
        },
      })

      if (!board) {
        throw new Error('Planche non trouvée')
      }

      await prisma.$transaction(async (tx) => {
        if (board.pointsAwarded && board.pointsAwarded > 0) {
          await tx.pointsHistory.deleteMany({
            where: {
              userId: board.userId,
              type: 'RECYCLING',
              pointsAmount: board.pointsAwarded,
              createdAt: {
                gte: new Date(board.updatedAt.getTime() - 60000),
              },
            },
          })

          await tx.user.update({
            where: { id: board.userId },
            data: {
              points: {
                decrement: board.pointsAwarded,
              },
            },
          })
        }

        await tx.usedBoard.delete({
          where: {
            id: boardId,
          },
        })
      })

      for (const imagePath of board.image) {
        const fullPath = path.join(process.cwd(), 'public', imagePath)
        try {
          await unlink(fullPath)
        } catch (err) {
          console.error(
            `Erreur lors de la suppression du fichier ${fullPath}:`,
            err
          )
        }
      }

      return NextResponse.json(
        { message: 'Planche supprimée avec succès' },
        { status: 200 }
      )
    } catch (error) {
      console.error('Erreur lors de la suppression de la planche:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
  }
}

const controller = new UsedBoardController()

export async function POST(req: NextRequest) {
  return controller.create(req)
}

export async function PATCH(req: NextRequest) {
  return controller.update(req)
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const boardId = url.searchParams.get('boardId')

  if (!boardId) {
    return NextResponse.json(
      { error: 'ID de planche manquant' },
      { status: 400 }
    )
  }

  return controller.deleteBoard(boardId)
}
