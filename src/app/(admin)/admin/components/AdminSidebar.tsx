'use client';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  Package,
  ShoppingBag,
  Bell,
  Plus,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
}

interface AdminSidebarProps {
  currentPath: string;
}

const sidebarItems: SidebarItem[] = [
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

export const AdminSidebar = ({ currentPath }: AdminSidebarProps) => {
  return (
    <div className="bg-[#f8f7f4] rounded-xl p-6 h-fit">
      <h3 className="text-lg font-medium text-[#010101] mb-6">
        Administration
      </h3>
      <nav className="space-y-2">
        {sidebarItems.map(item => {
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
