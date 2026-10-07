import { render, screen } from '@testing-library/react';
import { CalendarCheck } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders the label and a numeric value', () => {
    render(<StatCard label="Total bookings" value={42} />);
    expect(screen.getByText('Total bookings')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders a pre-formatted string value as-is', () => {
    render(<StatCard label="Income" value="UZS 100,000" />);
    expect(screen.getByText('UZS 100,000')).toBeInTheDocument();
  });

  it('renders an icon badge when an icon is provided', () => {
    const { container } = render(<StatCard label="Bookings" value={5} icon={CalendarCheck} tone="blue" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders hint text when provided', () => {
    render(<StatCard label="X" value={1} hint="extra context" />);
    expect(screen.getByText('extra context')).toBeInTheDocument();
  });
});
