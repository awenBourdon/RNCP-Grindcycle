import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deleteUserAction } from '@/actions/delete-user.action';
import { DeleteUserButton } from './DeleteUserButton';
import '@testing-library/jest-dom';

jest.mock('@/actions/delete-user.action', () => ({
  deleteUserAction: jest.fn(),
}));

jest.mock('@/components/ui/Spinner', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="spinner">Loading...</div>,
  };
});

describe('DeleteUserButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('doit afficher correctement le bouton', () => {
    render(<DeleteUserButton userId="user123" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('size-7 rounded-sm text-black cursor-pointer');
  });

//   it('doit désactiver le bouton et afficher le spinner lors du clic', async () => {
//     const user = userEvent.setup();
//     (deleteUserAction as jest.Mock).mockResolvedValue({});

//     render(<DeleteUserButton userId="user123" />);
//     const button = screen.getByRole('button');

//     await user.click(button);

//     await waitFor(() => {
//       expect(button).toBeDisabled();
//       expect(screen.getByTestId('spinner')).toBeInTheDocument();
//     });

//     await waitFor(() => {
//       expect(deleteUserAction).toHaveBeenCalledWith({ userId: 'user123' });
//     });
//   });

  it('doit réactiver le bouton et cacher le spinner après la complétion de l\'action', async () => {
    const user = userEvent.setup();
    (deleteUserAction as jest.Mock).mockResolvedValue({});

    render(<DeleteUserButton userId="user123" />);
    const button = screen.getByRole('button');

    await user.click(button);

    await waitFor(() => {
      expect(deleteUserAction).toHaveBeenCalledWith({ userId: 'user123' });
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });
  });
});
