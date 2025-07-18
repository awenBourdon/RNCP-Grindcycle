'use client'
import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { useAbortController } from '@/hooks/useAbortController'
import { Notification } from '@/lib/types'

export const UserNotifications = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { createSignal } = useAbortController()

  useEffect(() => {
    const fetchNotifications = async () => {
      const signal = createSignal()

      try {
        const response = await fetch(`/api/notifications?userId=${userId}`, {
          signal: signal,
        })
        const data = await response.json()
        const unreadNotifications = data.filter(
          (notification: Notification) => !notification.isRead
        )
        setNotifications(unreadNotifications)
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error(
            'Erreur lors de la récupération des notifications:',
            error
          )
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    if (userId) {
      fetchNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleMarkAsRead = async (notificationId: string) => {
    const signal = createSignal()

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId, isRead: true }),
        signal: signal,
      })

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification.id !== notificationId
          )
        )
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error(
          'Erreur lors du marquage de la notification comme lue:',
          error
        )
      }
    }
  }

  if (isLoading) {
    return <div>Chargement des notifications...</div>
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell size={24} className="text-[#0a3d3f] mr-3" />
            <h2 className="text-xl font-medium text-black">Notifications</h2>
          </div>
        </div>
        <p className="text-gray-500">Aucune nouvelle notification.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bell size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-xl font-medium text-black">
            Notifications ({notifications.length} non lue
            {notifications.length > 1 ? 's' : ''})
          </h2>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-4 rounded-lg border bg-blue-50 border-blue-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <p className="text-sm text-blue-900 font-medium">
                  {notification.description}
                </p>
              </div>
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className="cursor-pointer inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors ml-3"
              >
                <Check size={12} className="mr-1" />
                Marqué comme &quot;lu&quot;
              </button>
            </div>
            <p className="text-xs mt-2 text-gray-500">
              {notification.createdAt
                ? new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Date invalide'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
