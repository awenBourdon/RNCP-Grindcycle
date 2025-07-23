'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { UserPlus, Mail, Lock } from 'lucide-react'
import { z } from 'zod'
import { signUpSchema } from '@/lib/validations/authValidation'
import { signUpEmailAction } from '@/actions/sign-up-email.action'
import { Spinner } from '@/components/ui/Spinner'

type SignUpInput = z.infer<typeof signUpSchema>

export const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  })

  const router = useRouter()

  async function onSubmit(data: SignUpInput) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('password', data.password)

    const { error } = await signUpEmailAction(formData)

    if (error) {
      toast.error(error)
    } else {
      toast.success('Compte créé avec succès.')
      router.push('/authentification/inscription/succes')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nom d&apos;utilisateur
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserPlus size={16} className="text-gray-400" />
          </div>
          <input
            id="name"
            {...register('name')}
            placeholder="Ton nom d'utilisateur"
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          />
        </div>
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={16} className="text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            {...register('email')}
            placeholder="ton@email.com"
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type="password"
            id="password"
            {...register('password')}
            placeholder="••••••••"
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          />
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors ${
          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? (
          <Spinner />
        ) : (
          <>
            <UserPlus size={16} className="mr-2" />
            S&apos;inscrire
          </>
        )}
      </button>
    </form>
  )
}
