'use client';
import { useState } from 'react';
import { Bell, Check, User, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AdminNotification } from '@/lib/types';

interface AdminNotificationsProps {
  notifications: AdminNotification[];
}

export function AdminNotifications({ notifications }: AdminNotificationsProps) {
  const router = useRouter();
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  const unreadNotifications = notifications.filter((notif) => !notif.isRead);

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId, isRead: true }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la notification');
      }
      router.refresh();
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  if (unreadNotifications.length === 0) {
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="flex items-center mb-8">
          <Bell size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">
            Notifications Admin
          </h2>
        </div>
        <div className="text-center py-12">
          <Bell size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune nouvelle notification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center mb-8">
        <Bell size={24} className="text-[#0a3d3f] mr-3" />
        <h2 className="text-2xl font-normal text-[#010101]">
          Notifications Admin ({unreadNotifications.length} non lues)
        </h2>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {unreadNotifications.slice(0, 20).map((notification) => (
            <div
              key={notification.id}
              className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#0a3d3f] rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#010101] mb-2">
                        {notification.description}
                      </p>
                      {notification.user && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <User size={14} />
                          <span>{notification.user.name || 'Utilisateur'}</span>
                          <span>•</span>
                          <span>{notification.user.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} />
                        <span>
                          {new Date(notification.createdAt).toLocaleDateString(
                            'fr-FR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={markingAsRead === notification.id}
                  className="cursor-pointer inline-flex items-center px-2 py-1 text-xs font-medium text-[#0a3d3f] bg-white border border-[#0a3d3f] rounded-md hover:bg-[#0a3d3f] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-3"
                >
                  <Check size={12} className="mr-1" />
                  {markingAsRead === notification.id
                    ? '...'
                    : 'Marqué comme "lu"'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {unreadNotifications.length > 20 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Et {unreadNotifications.length - 20} autres notifications...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
