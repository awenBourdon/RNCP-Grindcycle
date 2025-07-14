'use server'
import { auth } from '@/lib/auth'
import { checkRateLimit, getClientIP, RATE_LIMIT_MESSAGES } from '@/lib/rateLimit'
import { passwordSchema } from '@/lib/zod-validations/authValidation'
import { APIError } from 'better-auth/api'
import { headers } from 'next/headers'

const passwordSchemaZod = passwordSchema

export async function changePasswordAction(formData: FormData) {
  const headersList = await headers()
  
  // TODO : Enlever localhost quand ce sera déployé
  const request = new Request('http://localhost', { headers: headersList })
  const clientIP = getClientIP(request)
  
  if (!checkRateLimit(clientIP, 'changePassword')) {
    return { error: RATE_LIMIT_MESSAGES.changePassword }
  }
  
  const currentPassword = String(formData.get('currentPassword'))
  if (!currentPassword)
    return { error: 'Veuillez entrer votre mot de passe actuel' }

  const newPassword = String(formData.get('newPassword'))
  if (!newPassword)
    return { error: 'Veuillez entrer votre nouveau mot de passe' }

  try {
    passwordSchemaZod.parse(newPassword)
  } catch {
    return { error: 'Le mot de passe doit contenir au moins 12 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial' }
  }

  try {
    await auth.api.changePassword({
      headers: headersList,
      body: {
        currentPassword,
        newPassword,
      },
    })
    return { error: null }
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message }
    }

    return { error: 'Erreur interne du serveur' }
  }
}
