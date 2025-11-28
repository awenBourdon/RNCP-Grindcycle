'use client';
import { useState, useEffect, useTransition } from 'react';
import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAbortController } from '@/hooks/useAbortController';
import { PaginationMeta } from '@/lib/utils/pagination';
import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from '@/actions/notifications/notification.action';

interface Notification {
  id: string;
  description: string;
  createdAt: Date;
}

interface UserNotificationsProps {
  userId: string;
}

export const UserNotifications = ({ userId }: UserNotificationsProps) => {
  const [isPending, startTransition] = useTransition();
  const { createSignal } = useAbortController();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotifications = async (page: number = 1) => {
    const signal = createSignal();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/notifications?${params.toString()}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error('Erreur chargement notifications');
      }

      const result = await response.json();

      if (!signal.aborted) {
        if (page === 1) {
          setNotifications(result.data);
        } else {
          setNotifications(prev => [...prev, ...result.data]);
        }
        setMeta(result.meta);
        setCurrentPage(page);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur chargement notifications:', error);
        if (!signal.aborted) {
          setError('Impossible de charger les notifications');
        }
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMoreNotifications = async () => {
    if (loading || !meta.hasNextPage) return;
    await fetchNotifications(currentPage + 1);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    startTransition(async () => {
      try {
        const result = await markNotificationAsReadAction(notificationId);
        if (result.success) {
          setNotifications(prevNotifications =>
            prevNotifications.filter(
              notification => notification.id !== notificationId
            )
          );
          setMeta(prev => ({
            ...prev,
            totalItems: Math.max(0, prev.totalItems - 1),
          }));
          toast.success(result.message);
        } else {
          toast.error(result.error);
        }
      } catch {
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
          setMeta({
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 20,
            hasNextPage: false,
            hasPreviousPage: false,
          });
          toast.success(result.message);
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error('Une erreur est survenue');
      }
    });
  };

  if (error) {
    return (
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchNotifications(1)}
            className="px-4 py-2 bg-[#0a3d3f] text-white rounded-lg hover:bg-[#083032] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#f8f7f4] rounded-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Bell size={24} className="text-[#0a3d3f] mr-3" />
            <h2 className="text-2xl font-normal text-[#010101]">
              Notifications
              {meta.totalItems > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  ({notifications.length}/{meta.totalItems})
                </span>
              )}
            </h2>
          </div>
          {notifications.length > 1 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="px-6 py-3 text-sm font-medium text-white bg-[#0a3d3f] rounded-full hover:bg-[#0a4d4f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600">Chargement des notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
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
            {notifications.map(notification => (
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
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0a3d3f] rounded-full hover:bg-[#0a4d4f] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

      {meta.hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMoreNotifications}
            disabled={loading}
            className="px-8 py-4 bg-[#0a3d3f] text-white rounded-full cursor-pointer hover:bg-[#083032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Chargement...'
              : `Charger plus (${notifications.length}/${meta.totalItems})`}
          </button>
        </div>
      )}

      {!meta.hasNextPage && notifications.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>Toutes les notifications ont été chargées</p>
        </div>
      )}
    </div>
  );
};
