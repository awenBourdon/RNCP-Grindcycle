'use client';
import type React from 'react';
import Link from 'next/link';
import {
  User,
  Settings,
  Key,
  Package,
  Bell,
  Heart,
  ShoppingBag,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
}

interface AccountSidebarProps {
  currentPath: string;
}

const sidebarItems: SidebarItem[] = [
  { id: 'profil', label: 'Profil', icon: User, href: '/compte/profil' },
  { id: 'securite', label: 'Sécurité', icon: Key, href: '/compte/securite' },
  {
    id: 'informations',
    label: 'Informations',
    icon: Settings,
    href: '/compte/informations',
  },
  {
    id: 'planches',
    label: 'Mes planches',
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

export const AccountSidebar = ({ currentPath }: AccountSidebarProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-6 h-fit">
      <h3 className="text-lg font-medium text-[#010101] mb-6">Mon compte</h3>
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#0a3d3f] text-white shadow-sm'
                  : 'text-[#010101] hover:bg-white hover:shadow-sm'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
