import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { getApiErrorMessage } from '../utils/apiError';

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      toast.success(t('messages.loginSuccess'));
      navigate(location.state?.from || '/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.loginFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="app-label">{t('common.email')}</label>
          <input
            type="email"
            className="app-input"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder={t('placeholders.loginEmail')}
          />
        </div>
        <div>
          <label className="app-label">{t('common.password')}</label>
          <input
            type="password"
            className="app-input"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder={t('placeholders.password')}
          />
        </div>
        <button type="submit" className="app-button w-full" disabled={submitting}>
          {submitting ? t('messages.loggingIn') : t('buttons.login')}
        </button>
      </form>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
        <p className="font-medium text-white">{t('auth.sampleAccounts')}</p>
        <p className="mt-2">
          {t('auth.sampleUser')}: <code>user@stadionhub.uz</code> / <code>User123!</code>
        </p>
        <p>
          {t('auth.sampleOwner')}: <code>owner@stadionhub.uz</code> / <code>Owner123!</code>
        </p>
      </div>

      <p className="text-sm text-gray-400">
        {t('auth.needAccount')}{' '}
        <Link to="/register" className="text-green-300">
          {t('auth.registerHere')}
        </Link>
      </p>
    </div>
  );
}
