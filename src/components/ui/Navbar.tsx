'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, X, Menu, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAbortController } from '@/hooks/useAbortController'
import { Notification } from '@/lib/types'

interface NavbarUser {
  id: string
}

interface NavbarProps {
  user: NavbarUser | null
}

export const Navbar = ({ user }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { getCartCount } = useCart()
  const { createSignal } = useAbortController()
  const cartCount = getCartCount()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(window.scrollY)
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = 'auto'
      document.body.style.position = 'static'
    }

    return () => {
      document.body.style.overflow = 'auto'
      document.body.style.position = 'static'
    }
  }, [isMenuOpen])

  useEffect(() => {
    let isMounted = true

    const fetchUnreadNotifications = async () => {
      if (!user?.id) return

      const signal = createSignal()

      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`, {
          signal: signal,
          cache: 'force-cache',
        })
        if (!response.ok) return

        const notifications: Notification[] = await response.json()
        const unreadNotifications = notifications.filter(
          (notification) => !notification.isRead
        )

        if (isMounted) {
          setUnreadCount(unreadNotifications.length)
          if (user?.id) {
            sessionStorage.setItem(
              `unreadCount_${user.id}`,
              unreadNotifications.length.toString()
            )
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== 'AbortError' &&
          isMounted
        ) {
          setUnreadCount(0)
        }
      }
    }

    const cachedCount = sessionStorage.getItem(`unreadCount_${user?.id}`)
    if (cachedCount && user?.id && isMounted) {
      setUnreadCount(parseInt(cachedCount))
    }

    if (user?.id) {
      fetchUnreadNotifications()
    }

    return () => {
      isMounted = false
    }
  }, [user?.id, createSignal])

  useEffect(() => {
    const baseTitle = 'Grindcycle'

    if (user && unreadCount > 0) {
      document.title = `${baseTitle} (${unreadCount})`
    } else {
      document.title = baseTitle
    }

    return () => {
      document.title = baseTitle
    }
  }, [unreadCount, user])

  return (
    <header
      className={`fixed top-0 left-0 w-full p-5 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } z-50 ${isScrolled ? 'bg-[#f8f7f4]/90 backdrop-blur-md' : 'bg-[#f8f7f4]'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="mobile-show hidden mr-4">
            <button
              className="flex items-center justify-center p-1 text-[#010101] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <Link
            href="/"
            className="text-2xl md-flex-768:text-3xl font-bold tracking-tight text-[#010101] px-3 py-1"
          >
            GRINDCYCLE
          </Link>
        </div>

        <div className="hidden md-flex-880 items-center space-x-4">
          <Link
            href="/a-propos"
            className="px-4 py-1.5 font-medium text-[#010101] hover:text-[#0a3d3f] transition-colors"
          >
            À PROPOS
          </Link>
          <Link
            href="/catalogue"
            className="px-4 py-1.5 font-medium text-[#010101] hover:text-[#0a3d3f] transition-colors"
          >
            CATALOGUE
          </Link>
          <Link
            href="/recycler-planche/redirect"
            className="bg-[#0a3d3f] text-white font-medium py-1.5 px-6 rounded-full hover:bg-[#0a4d4f] transition-colors"
          >
            RECYCLER MA PLANCHE
          </Link>
          <Link
            href="/compte/profil"
            className="p-2 text-[#010101] hover:text-[#0a3d3f] transition-colors relative"
            aria-label="Mon compte"
          >
            <User size={20} />
            {user && unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0a3d3f] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/panier"
            className="p-2 text-[#010101] hover:text-[#0a3d3f] transition-colors relative"
            aria-label="Panier"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0a3d3f] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <div className="flex mobile-hide items-center space-x-4">
          <Link
            href="/compte/profil"
            className="p-2 text-[#010101] hover:text-[#0a3d3f] transition-colors relative"
            aria-label="Mon compte"
          >
            <User size={20} />
            {user && unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0a3d3f] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/panier"
            className="p-2 text-[#010101] hover:text-[#0a3d3f] transition-colors relative"
            aria-label="Panier"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0a3d3f] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#f8f7f4] z-50 flex flex-col h-screen w-screen">
          <div className="flex items-center justify-between p-5">
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fermer le menu"
              className="text-[#010101]"
            >
              <X size={24} />
            </button>
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-[#010101] px-3 py-1"
            >
              GRINDCYCLE
            </Link>
            <div className="w-10"></div>
          </div>

          <div className="flex flex-col p-8 text-3xl font-bold space-y-6">
            <Link
              href="/catalogue"
              onClick={() => setIsMenuOpen(false)}
              className="text-[#010101] border-b border-gray-200 pb-2 hover:pl-2 transition-all"
            >
              Catalogue
            </Link>
            <Link
              href="/a-propos"
              onClick={() => setIsMenuOpen(false)}
              className="text-[#010101] border-b border-gray-200 pb-2 hover:pl-2 transition-all"
            >
              À propos
            </Link>
            <Link
              href="/compte/profil"
              onClick={() => setIsMenuOpen(false)}
              className="text-[#010101] border-b border-gray-200 pb-2 hover:pl-2 transition-all relative flex items-center"
            >
              Mon compte
              {user && unreadCount > 0 && (
                <span className="ml-3 bg-[#0a3d3f] text-white text-sm font-bold rounded-full min-w-[24px] h-[24px] flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/panier"
              onClick={() => setIsMenuOpen(false)}
              className="text-[#010101] border-b border-gray-200 pb-2 hover:pl-2 transition-all relative flex items-center"
            >
              Panier
              {cartCount > 0 && (
                <span className="ml-3 bg-[#0a3d3f] text-white text-sm font-bold rounded-full min-w-[24px] h-[24px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex flex-col px-8 text-lg space-y-4">
            <Link
              href="/faq"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
            >
              Politique de confidentialité
            </Link>
            <Link
              href="/terms"
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-600 hover:text-[#010101] hover:pl-2 transition-all"
            >
              Conditions d&apos;utilisation
            </Link>
            <Link
              href="/recycler-planche/redirect"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex h-14 items-center justify-center rounded-full px-10 py-4 text-lg font-medium uppercase tracking-wide text-white bg-[#0a3d3f] hover:bg-[#0a4d4f] transition-colors mt-4"
            >
              RECYCLER MA PLANCHE
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
