import localFont from 'next/font/local'
import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

const splineSans = localFont({
  src: '../../public/fonts/SplineSans.ttf',
  weight: '100 900',
  variable: '--font-splineSans',
})

export const metadata: Metadata = {
  description:
    "Grindcycle, la plateforme d'e-commerce de vente de skate recyclés",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  let user = null

  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (session?.user) {
    user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    }
  }

  return (
    <html lang="fr">
      <body className={`${splineSans.className} antialiased`}>
        <AuthProvider user={user}>
          <CartProvider>
            <Navbar />
            {children}
            <Toaster position="top-center" richColors />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
