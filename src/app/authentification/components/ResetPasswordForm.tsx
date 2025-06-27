'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/Spinner'
import { resetPassword } from '@/lib/auth-client'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'
import { resetPasswordSchema } from '@/lib/validation/authValidation'
import { z } from 'zod'

interface ResetPasswordFormProps {
  token: string
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [isPending, setIsPending] = useState(false)
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  })
  const router = useRouter()

  const validatePassword = () => {
    try {
      resetPasswordSchema.parse(formData)
      setErrors({ password: '', confirmPassword: '' })
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = { password: '', confirmPassword: '' }
        err.errors.forEach((error) => {
          if (error.path && typeof error.path[0] === 'string') {
            const field = error.path[0] as keyof typeof newErrors
            newErrors[field] = error.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()

    if (!validatePassword()) {
      return
    }

    setIsPending(true)

    try {
      await resetPassword({
        newPassword: formData.password,
        token,
        fetchOptions: {
          onRequest: () => {},
          onResponse: () => {},
          onError: (ctx) => {
            toast.error(ctx.error.message)
          },
          onSuccess: () => {
            toast.success('Mot de passe changé avec succès.')
            router.push('/authentification/connexion')
          },
        },
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent"
          />
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-gray-700"
        >
          Confirmer le nouveau mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors ${
          isPending ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isPending ? <Spinner /> : 'Réinitialiser ton mot de passe'}
      </button>
    </form>
  )
}
