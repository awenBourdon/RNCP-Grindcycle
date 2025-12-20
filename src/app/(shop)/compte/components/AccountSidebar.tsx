'use client';
import type React from 'react';
import Link from 'next/link';
import {
  User,
  Key,
  Package,
  Bell,
  Heart,
  ShoppingBag,
  Coins,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAbortController } from '@/hooks/useAbortController';
import { Notification } from '@/lib/utils/types/types';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
}

interface AccountSidebarProps {
  currentPath: string;
  user: { id: string } | null;
}

const sidebarItems: SidebarItem[] = [
  { id: 'profil', label: 'Profil', icon: User, href: '/compte/profil' },
  { id: 'securite', label: 'Sécurité', icon: Key, href: '/compte/securite' },
  {
    id: 'planches',
    label: 'Planches envoyés',
    icon: Package,
    href: '/compte/planches',
  },
  {
    id: 'commandes',
    label: 'Mes commandes',
    icon: ShoppingBag,
    href: '/compte/commandes',
  },
  {
    id: 'points',
    label: 'Mes points',
    icon: Coins,
    href: '/compte/points',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/compte/notifications',
  },
  {
    id: 'favoris',
    label: 'Favoris',
    icon: Heart,
    href: '/compte/favoris',
  },
];



export const AccountSidebar = ({ currentPath, user }: AccountSidebarProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { createSignal } = useAbortController();

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user?.id) return;

    const signal = createSignal();

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`, {
        signal: signal,
        cache: 'default',
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();
      const notifications: Notification[] = result.data;
      const unreadNotifications = notifications.filter(
        (notification: Notification) => !notification.isRead
      );

      if (!signal.aborted) {
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        if (!signal.aborted) {
          setUnreadCount(0);
        }
      }
    }
  }, [user?.id, createSignal]);

  useEffect(() => {
    if (user?.id) {
      fetchUnreadNotifications();
      window.addEventListener('notificationUpdated', fetchUnreadNotifications);
      return () => {
        window.removeEventListener('notificationUpdated', fetchUnreadNotifications);
      };
    } else {
      setUnreadCount(0);
    }
  }, [user?.id, fetchUnreadNotifications]);

  return (
    <div
      className="bg-[#f8f7f4] rounded-xl p-6 h-fit"
      aria-label="Navigation du compte utilisateur"
    >
      <h3 className="text-lg font-medium text-[#010101] mb-6">Mon compte</h3>
      <nav className="space-y-2" aria-label="Menu du compte">
        {sidebarItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                isActive
                  ? 'bg-[#0a3d3f] text-white shadow-sm'
                  : 'text-[#010101] hover:bg-white hover:shadow-sm'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'notifications' && unreadCount > 0 && (
                 <span className={`ml-auto text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${isActive ? 'bg-white text-[#0a3d3f]' : 'bg-[#0a3d3f] text-white'}`}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                 </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
