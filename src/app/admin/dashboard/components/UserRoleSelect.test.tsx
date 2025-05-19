import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { admin } from '@/lib/auth-client';
import { toast } from 'sonner';
import '@testing-library/jest-dom';
import { UserRoleSelect } from './UserRoleSelect';
import React from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('@/lib/auth-client', () => ({
  admin: {
    hasPermission: jest.fn(),
    setRole: jest.fn(),
  },
}));

jest.mock('@/components/ui/Spinner', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="spinner">Loading...</div>,
  };
});

describe('UserRoleSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    
    (admin.hasPermission as jest.Mock).mockResolvedValue({ success: true });
    (admin.setRole as jest.Mock).mockImplementation(() => new Promise(() => {
      setTimeout(() => {}, 1000);
    }));

    render(<UserRoleSelect userId="user123" role="USER" />);
    
    const selectElement = screen.getByRole('combobox');
    await user.selectOptions(selectElement, 'ADMIN');
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('doit afficher une erreur quand l\'utilisateur n\'a pas les permissions', async () => {
    const user = userEvent.setup();
    
    (admin.hasPermission as jest.Mock).mockResolvedValue({ error: 'Permission denied' });

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
    
    (admin.hasPermission as jest.Mock).mockResolvedValue({ success: true });
    
    (admin.setRole as jest.Mock).mockImplementation(({ fetchOptions }) => {
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
    
    (admin.hasPermission as jest.Mock).mockResolvedValue({ success: true });
    
    (admin.setRole as jest.Mock).mockImplementation(({ fetchOptions }) => {
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
    

    (admin.hasPermission as jest.Mock).mockResolvedValue({ success: true });
    
    (admin.setRole as jest.Mock).mockRejectedValue(new Error('Erreur inattendue'));

    render(<UserRoleSelect userId="user123" role="USER" />);
    
    const selectElement = screen.getByRole('combobox');
    await user.selectOptions(selectElement, 'ADMIN');
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Une erreur s\'est produite.');
    });
  });
});