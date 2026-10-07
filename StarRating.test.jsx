import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders in read-only mode with no buttons', () => {
    render(<StarRating value={3} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders 5 interactive buttons and fires onRate with the clicked value', async () => {
    const onRate = vi.fn();
    render(<StarRating value={2} interactive onRate={onRate} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);

    await userEvent.click(screen.getByRole('button', { name: '4' }));
    expect(onRate).toHaveBeenCalledWith(4);
  });

  it('disables every star button when disabled is true', () => {
    render(<StarRating value={1} interactive disabled onRate={() => {}} />);

    screen.getAllByRole('button').forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
