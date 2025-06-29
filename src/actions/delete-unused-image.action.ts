import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

// TODO : automatiser la suppression des images si fait directement dans la db +utiliser scaleway peut etre pour les stoccker ??
// Pour le moment -> npx esno src/actions/delete-unused-image.action.ts
async function deleteUnusedImages() {
  try {
    const usedBoards = await prisma.usedBoard.findMany({
      select: { image: true },
    })

    const products = await prisma.product.findMany({
      select: { imageUrl: true },
    })

    const usedFilePaths = new Set<string>()

    usedBoards.forEach((board: { image: string[] }) => {
      board.image.forEach((filePath) => {
        if (filePath) {
          usedFilePaths.add(path.join(process.cwd(), 'public', filePath))
        }
      })
    })

    products.forEach((product: { imageUrl: string[] }) => {
      if (product.imageUrl && Array.isArray(product.imageUrl)) {
        product.imageUrl.forEach((filePath) => {
          if (filePath && filePath.trim() !== '') {
            usedFilePaths.add(path.join(process.cwd(), 'public', filePath))
          }
        })
      }
    })

    const boardsDir = path.join(process.cwd(), 'public', 'uploads', 'boards')
    if (fs.existsSync(boardsDir)) {
      const boardFiles = fs.readdirSync(boardsDir)
      boardFiles.forEach((file) => {
        const filePath = path.join(boardsDir, file)
        if (!usedFilePaths.has(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`Supprimé: boards/${file}`)
        }
      })
    }

    const productsDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (fs.existsSync(productsDir)) {
      const productFiles = fs.readdirSync(productsDir)
      productFiles.forEach((file) => {
        const filePath = path.join(productsDir, file)
        if (!usedFilePaths.has(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`Supprimé: products/${file}`)
        }
      })
    }

    console.log('Nettoyage terminé!')

  } catch (error) {
    console.error('Erreur:', error)
  }
}

deleteUnusedImages()