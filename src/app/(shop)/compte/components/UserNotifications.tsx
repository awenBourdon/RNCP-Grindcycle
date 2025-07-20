'use client'
import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { useAbortController } from '@/hooks/useAbortController'
import type { Notification } from '@/lib/types'

export const UserNotifications = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { createSignal } = useAbortController()

  useEffect(() => {
    let isMounted = true

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

        if (isMounted) {
          setNotifications(unreadNotifications)
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error(
            'Erreur lors de la récupération des notifications:',
            error
          )
        }
      } finally {
        if (isMounted && !signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    if (userId) {
      fetchNotifications()
    }

    return () => {
      isMounted = false
    }
  }, [userId, createSignal])

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
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="flex items-center mb-8">
          <Bell size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">Notifications</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a3d3f]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Bell size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">
          Notifications{' '}
          {notifications.length > 0 && `(${notifications.length})`}
        </h2>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <Bell size={24} className="text-[#0a3d3f]" />
          </div>
          <h3 className="text-lg font-medium text-[#010101] mb-2">
            Aucune notification
          </h3>
          <p className="text-gray-600">Tu es à jour !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-6 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[#010101] font-medium mb-2">
                    {notification.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleDateString(
                          'fr-FR',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )
                      : 'Date invalide'}
                  </p>
                </div>
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#0a3d3f] bg-white border border-[#0a3d3f] rounded-lg hover:bg-[#0a3d3f] hover:text-white transition-colors ml-4"
                >
                  <Check size={14} className="mr-1" />
                  Marquer comme lu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
