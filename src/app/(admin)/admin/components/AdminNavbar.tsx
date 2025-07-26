'use client';
import type React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  Package,
  ShoppingBag,
  Bell,
  Plus,
  ShoppingCart,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
}

interface AdminNavbarProps {
  currentPath: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: BarChart3,
    href: '/admin/tableau-de-bord',
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: Users,
    href: '/admin/utilisateurs',
  },
  { id: 'boards', label: 'Planches', icon: Package, href: '/admin/planches' },
  {
    id: 'products',
    label: 'Produits',
    icon: ShoppingBag,
    href: '/admin/produits',
  },
  {
    id: 'orders',
    label: 'Commandes',
    icon: ShoppingCart,
    href: '/admin/commandes',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/admin/notifications',
  },
  {
    id: 'add-product',
    label: 'Ajouter produit',
    icon: Plus,
    href: '/admin/ajouter-produit',
  },
];

export const AdminNavbar = ({ currentPath }: AdminNavbarProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-[#010101]">Admin panel</h3>
      </div>

      <nav className="hidden lg:block">
        <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-200 text-center ${
                  isActive
                    ? 'bg-[#0a3d3f] text-white shadow-sm'
                    : 'text-[#010101] hover:bg-white hover:shadow-sm'
                }`}
              >
                <Icon size={24} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <nav className="lg:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0a3d3f] text-white shadow-sm'
                    : 'text-[#010101] hover:bg-white hover:shadow-sm'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
