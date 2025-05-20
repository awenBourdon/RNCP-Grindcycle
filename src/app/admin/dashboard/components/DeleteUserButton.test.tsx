import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteUserButton } from './DeleteUserButton';

vi.mock('@/actions/delete-user.action', () => ({
  deleteUserAction: vi.fn(),
}));

vi.mock('@/components/ui/Spinner', () => {
  return {
    default: () => <div data-testid="spinner"></div>,
  };
});

describe('DeleteUserButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doit afficher correctement le bouton', () => {
    render(<DeleteUserButton userId="user123" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('size-7 rounded-sm text-black cursor-pointer');
  });

  // it('doit désactiver le bouton et afficher le spinner lors du clic', async () => {
  //   const user = userEvent.setup();
  //   const { deleteUserAction } = await import('@/actions/delete-user.action');
  //   (deleteUserAction as ReturnType<typeof vi.fn>).mockResolvedValue({});

  //   render(<DeleteUserButton userId="user123" />);
  //   const button = screen.getByRole('button');

  //   await user.click(button);

  //   await waitFor(() => {
  //     expect(button).toBeDisabled();
  //     expect(screen.getByTestId('spinner')).toBeInTheDocument();
  //   });

  //   await waitFor(() => {
  //     expect(deleteUserAction).toHaveBeenCalledWith({ userId: 'user123' });
  //   });
  // });

  it("doit réactiver le bouton et cacher le spinner après l'action", async () => {
    const user = userEvent.setup();
    const { deleteUserAction } = await import('@/actions/delete-user.action');
    (deleteUserAction as ReturnType<typeof vi.fn>).mockResolvedValue({});

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
