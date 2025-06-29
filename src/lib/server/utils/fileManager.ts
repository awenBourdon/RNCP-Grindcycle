import { unlink, access } from 'fs/promises'
import path from 'path'

export class FileManager {
  /**
   * Vérifie si un fichier existe
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Supprime un fichier de manière sécurisée
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath)
      
      if (await this.exists(fullPath)) {
        await unlink(fullPath)
        return true
      }
      
      return false
    } catch (error) {
      console.error(`Erreur suppression fichier ${filePath}:`, error)
      return false
    }
  }

  /**
   * Supprime plusieurs fichiers
   */
  static async deleteFiles(filePaths: string[]): Promise<{
    deleted: string[]
    failed: string[]
  }> {
    const deleted: string[] = []
    const failed: string[] = []

    for (const filePath of filePaths) {
      const success = await this.deleteFile(filePath)
      if (success) {
        deleted.push(filePath)
      } else {
        failed.push(filePath)
      }
    }

    return { deleted, failed }
  }

  /**
   * Génère un nom de fichier unique
   */
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const sanitizedName = this.sanitizeFilename(originalName)
    
    return `${timestamp}_${randomSuffix}_${sanitizedName}`
  }

  /**
   * Sanitise un nom de fichier
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/\s+/g, '_')           // Espaces -> underscores
      .replace(/[^a-zA-Z0-9_.-]/g, '') // Garder seulement alphanumerique + _ . -
      .toLowerCase()                   // Tout en minuscules
      .substring(0, 50)               // Limiter la longueur
  }

  /**
   * Extrait l'extension d'un fichier
   */
  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase()
  }

  /**
   * Calcule la taille totale des fichiers
   */
  static calculateTotalSize(files: File[]): number {
    return files.reduce((total, file) => total + file.size, 0)
  }

  /**
   * Formate une taille en bytes vers un format lisible
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Vérifie si un nom de fichier est valide
   */
  static isValidFilename(filename: string): boolean {
    // Caractères interdits dans les noms de fichiers
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
    
    // Noms réservés Windows
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i
    
    return !invalidChars.test(filename) && 
           !reservedNames.test(filename) &&
           filename.length > 0 &&
           filename.length <= 255
  }

  /**
   * Crée un nom de fichier sûr à partir d'un nom donné
   */
  static createSafeFilename(filename: string): string {
    let safeName = filename
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Remplacer caractères interdits
      .replace(/\s+/g, '_')                    // Espaces -> underscores
      .replace(/_{2,}/g, '_')                  // Multiple underscores -> single
      .replace(/^_|_$/g, '')                   // Supprimer underscores début/fin
    
    // Limiter la longueur en gardant l'extension
    const extension = path.extname(safeName)
    const nameWithoutExt = path.basename(safeName, extension)
    
    if (nameWithoutExt.length > 200) {
      safeName = nameWithoutExt.substring(0, 200) + extension
    }
    
    // Si le nom est réservé, ajouter un suffixe
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i
    if (reservedNames.test(path.basename(safeName, extension))) {
      const nameOnly = path.basename(safeName, extension)
      safeName = `${nameOnly}_file${extension}`
    }
    
    return safeName || 'unnamed_file'
  }

  /**
   * Copie un fichier d'un endroit à un autre
   */
  static async copyFile(sourcePath: string, destPath: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises')
      const sourceFullPath = path.join(process.cwd(), 'public', sourcePath)
      const destFullPath = path.join(process.cwd(), 'public', destPath)
      
      // Vérifier que le fichier source existe
      if (!await this.exists(sourceFullPath)) {
        return false
      }
      
      // Créer le dossier de destination si nécessaire
      const destDir = path.dirname(destFullPath)
      await fs.mkdir(destDir, { recursive: true })
      
      // Copier le fichier
      await fs.copyFile(sourceFullPath, destFullPath)
      return true
    } catch (error) {
      console.error(`Erreur copie fichier ${sourcePath} -> ${destPath}:`, error)
      return false
    }
  }

  static async moveFile(sourcePath: string, destPath: string): Promise<boolean> {
    try {
      const success = await this.copyFile(sourcePath, destPath)
      if (success) {
        await this.deleteFile(sourcePath)
        return true
      }
      return false
    } catch (error) {
      console.error(`Erreur déplacement fichier ${sourcePath} -> ${destPath}:`, error)
      return false
    }
  }
}
