import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { admin } from '@/lib/auth-client';
import { toast } from 'sonner';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRoleSelect } from '@/app/admin/dashboard/components/UserRoleSelect';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/lib/auth-client', () => ({
  admin: {
    hasPermission: vi.fn(),
    setRole: vi.fn(),
  },
}));

vi.mock('@/components/ui/Spinner', () => {
  return {
    default: () => <div data-testid="spinner"></div>,
  };
});

describe('UserRoleSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doit afficher correctement le rôle actuel', () => {
    render(<UserRoleSelect userId="user123" role="USER" />);
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('USER');
    expect(selectElement).not.toBeDisabled();
  });

  it('doit désactiver le select quand le rôle est ADMIN', () => {
    render(<UserRoleSelect userId="user123" role="ADMIN" />);
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeDisabled();
  });

  it('doit afficher le spinner pendant la transition', async () => {
    const user = userEvent.setup();
    
    (admin.hasPermission as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (admin.setRole as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {
      setTimeout(() => {}, 1000);
    }));

    render(<UserRoleSelect userId="user123" role="USER" />);
    
    const selectElement = screen.getByRole('combobox');
    await user.selectOptions(selectElement, 'ADMIN');
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('doit afficher une erreur quand l\'utilisateur n\'a pas les permissions', async () => {
    const user = userEvent.setup();
    
    (admin.hasPermission as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ error: 'Permission denied' });

    render(<UserRoleSelect userId="user123" role="USER" />);
    
    const selectElement = screen.getByRole('combobox');
    await user.selectOptions(selectElement, 'ADMIN');
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Interdit');
    });
    
    expect(admin.setRole).not.toHaveBeenCalled();
  });

  it('doit mettre à jour le rôle avec succès', async () => {
    const user = userEvent.setup();
    
    (admin.hasPermission as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    
    (admin.setRole as unknown as ReturnType<typeof vi.fn>).mockImplementation(({ fetchOptions }) => {
      fetchOptions.onSuccess();
      return Promise.resolve();
    });

    render(<UserRoleSelect userId="user123" role="USER" />);
    
    const selectElement = screen.getByRole('combobox');
    await user.selectOptions(selectElement, 'ADMIN');
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Rôle mis à jour.');
    });
 
    expect(admin.setRole).toHaveBeenCalledWith({
      userId: 'user123',
      role: 'ADMIN',
      fetchOptions: expect.any(Object),
    });
  });

  it('doit gèrer une erreur lors du changement de rôle', async () => {
    const user = userEvent.setup();
    
    (admin.hasPermission as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    
    (admin.setRole as unknown as ReturnType<typeof vi.fn>).mockImplementation(({ fetchOptions }) => {
      fetchOptions.onError({ error: { message: 'Erreur serveur' } });
      return Promise.resolve();
    });

    render(<UserRoleSelect userId="user123" role="USER" />);
    
    const selectElement = screen.getByRole('combobox');
    await user.selectOptions(selectElement, 'ADMIN');
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erreur serveur');
    });
  });

  it('doit gèrer une exception inattendue', async () => {
    const user = userEvent.setup();
    
    (admin.hasPermission as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    
    (admin.setRole as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error());

    render(<UserRoleSelect userId="user123" role="USER" />);
    
    const selectElement = screen.getByRole('combobox');
    await user.selectOptions(selectElement, 'ADMIN');
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Une erreur s\'est produite.');
    });
  });
});