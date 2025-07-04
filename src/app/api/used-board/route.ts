import { type NextRequest } from 'next/server'
import { UsedBoardController } from '@/lib/server/controllers/usedBoardController'

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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'ID de planche manquant' 
      }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  return controller.delete(boardId)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const boardId = searchParams.get('id')
  const userId = searchParams.get('userId')

  if (boardId) {
    return controller.getById(boardId)
  }

  if (userId) {
    return controller.getUserBoards(userId)
  }

  return controller.getAll()
}
