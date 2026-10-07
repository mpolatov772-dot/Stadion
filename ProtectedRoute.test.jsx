import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ProtectedRoute } from './ProtectedRoute';
import { I18nProvider } from '../context/I18nContext';
import * as useAuthModule from '../hooks/useAuth';

const renderProtected = (roles) =>
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
          <Route
            path="/secret"
            element={
              <ProtectedRoute roles={roles}>
                <div>Secret content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );

describe('ProtectedRoute', () => {
  it('redirects to /login when the user is not authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({ isAuthenticated: false, isBooting: false, user: null });
    renderProtected();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('shows neither the login page nor the content while the session is booting', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({ isAuthenticated: false, isBooting: true, user: null });
    renderProtected();
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('redirects to /dashboard when the user role is not allowed', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isBooting: false,
      user: { role: 'user' },
    });
    renderProtected(['admin']);
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('renders the protected content when authenticated and the role matches', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isBooting: false,
      user: { role: 'admin' },
    });
    renderProtected(['admin']);
    expect(screen.getByText('Secret content')).toBeInTheDocument();
  });
});
