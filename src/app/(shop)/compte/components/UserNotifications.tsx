'use client';

import { useState, useEffect, useTransition } from 'react';
import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Notification } from '@/lib/types';
import { useAbortController } from '@/hooks/useAbortController';
import { markNotificationAsReadAction } from '@/actions/notifications/mark-as-read.action';
import { markAllNotificationsAsReadAction } from '@/actions/notifications/mark-all-as-read.action';

export const UserNotifications = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { createSignal } = useAbortController();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      const signal = createSignal();

      try {
        const response = await fetch(`/api/notifications?userId=${userId}`, {
          signal: signal,
        });
        const result = await response.json();
        if (result.success) {
          const unreadNotifications = result.data.filter(
            (notification: Notification) => !notification.isRead
          );
          setNotifications(unreadNotifications);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Erreur récupération notifications:', error);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [userId, createSignal]);

  const handleMarkAsRead = async (notificationId: string) => {
    startTransition(async () => {
      try {
        const result = await markNotificationAsReadAction(notificationId);
        if (result.success) {
          setNotifications((prevNotifications) =>
            prevNotifications.filter(
              (notification) => notification.id !== notificationId
            )
          );
          toast.success(result.message);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erreur marquage notification:', error);
        toast.error('Une erreur est survenue');
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      try {
        const result = await markAllNotificationsAsReadAction(userId);
        if (result.success) {
          setNotifications([]);
          toast.success(result.message);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erreur marquage toutes notifications:', error);
        toast.error('Une erreur est survenue');
      }
    });
  };

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
    );
  }

  return (
    <div className="bg-[#f8f7f4] rounded-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Bell size={24} className="text-[#0a3d3f] mr-3" />
          <h2 className="text-2xl font-normal text-[#010101]">
            Notifications{' '}
            {notifications.length > 0 && `(${notifications.length})`}
          </h2>
        </div>
        {notifications.length > 1 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="px-6 py-3 text-sm font-medium text-white bg-[#0a3d3f] rounded-full hover:bg-[#0a4d4f] transition-colors cursor-pointer"
          >
            Tout marquer comme lu
          </button>
        )}
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
                <div className="ml-4">
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={isPending}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0a3d3f] rounded-full hover:bg-[#0a4d4f] transition-colors cursor-pointer"
                    title="Marquer comme lu"
                  >
                    <Check size={14} className="mr-1" />
                    Marquer comme lu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
