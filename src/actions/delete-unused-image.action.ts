import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

// TODO : automatiser la suppression des images si fait directement dans la db
// Pour le moment -> npx esno src/actions/delete-unused-image.action.ts
async function deleteUnusedImage() {
  try {
    const usedFiles = await prisma.usedBoard.findMany({
      select: { image: true },
    })

    const usedFilePaths = new Set()
    usedFiles.forEach((board: { image: string[] }) => {
      board.image.forEach((filePath) => {
        usedFilePaths.add(path.join(process.cwd(), 'public', filePath))
      })
    })

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'boards')
    const files = fs.readdirSync(uploadDir)

    files.forEach((file) => {
      const filePath = path.join(uploadDir, file)
      if (!usedFilePaths.has(filePath)) {
        fs.unlinkSync(filePath)
      }
    })
  } catch (error) {
    console.error(error)
  }
}

deleteUnusedImage()
