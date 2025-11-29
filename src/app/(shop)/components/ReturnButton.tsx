import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

interface ReturnButtonProps {
  href: string;
  label: string;
}

export const ReturnButton = ({ href, label }: ReturnButtonProps) => {
  return (
    <Link
      href={href}
      className="flex items-center text-gray-600 mb-12 group cursor-pointer max-w-56"
      aria-label={`Retourner à ${label}`}
    >
      <ArrowLeftIcon
        className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
        aria-hidden="true"
      />
      <span className="border-b border-transparent group-hover:border-gray-600 pb-1 transition-colors">
        {label}
      </span>
    </Link>
  );
};
