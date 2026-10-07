import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { getApiErrorMessage } from '../utils/apiError';
import { roleOptions } from '../utils/options';
import { LocationPicker } from '../components/LocationPicker';

export function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { register, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    businessName: '',
    district: '',
    telegram: '',
    location: null,
  });
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.location || !Number.isFinite(Number(form.location.lat)) || !Number.isFinite(Number(form.location.lng))) {
      toast.error('Iltimos, yashash manzilingizni qidiring va roʻyxatdan tanlang');
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      toast.success(t('messages.registerSuccess'));
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.registrationFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const requiresBusinessInfo = form.role === 'stadiumOwner';

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3 rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
          <div>
            <label className="app-label">{t('labels.selectRole')}</label>
            <p className="mt-1 text-sm text-gray-400">Avval hisob turini tanlang. Keyingi maydonlar shu tanlovga mos chiqadi.</p>
          </div>
          {roleOptions.map((option) => (
            <label
              key={option.value}
              className={`block cursor-pointer rounded-xl border px-4 py-4 ${
                form.role === option.value
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{t(option.labelKey)}</p>
                  <p className="mt-1 text-sm text-gray-400">{t(option.descriptionKey)}</p>
                </div>
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={form.role === option.value}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value }))
                  }
                />
              </div>
            </label>
          ))}
        </div>

        <div>
          <label className="app-label">{t('common.fullName')}</label>
          <input
            className="app-input"
            required
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="app-label">{t('common.email')}</label>
            <input
              type="email"
              className="app-input"
              required
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </div>
          <div>
            <label className="app-label">{t('common.phone')}</label>
            <input
              className="app-input"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="app-label">{t('common.password')}</label>
          <input
            type="password"
            className="app-input"
            required
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
        </div>

        <div>
          <label className="app-label">Yashash manzilingiz</label>
          <LocationPicker
            title="Yashash joyingizni tanlang"
            description="Viloyatni tanlang, so‘ng xaritada aniq joyingizni bosing."
            city={form.location?.city || 'Tashkent'}
            lat={form.location?.lat}
            lng={form.location?.lng}
            onChange={(location) =>
              setForm((current) => ({
                ...current,
                location,
                district: location.address || location.city || '',
              }))
            }
          />
          {form.location ? (
            <p className="mt-2 text-xs text-green-300">
              Tanlandi: {form.location.address || form.location.city} ({form.location.lat}, {form.location.lng})
            </p>
          ) : null}
        </div>

        {requiresBusinessInfo ? (
          <div className="space-y-4 rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-medium text-white">{t('common.businessInfo')}</p>
            <div>
              <label className="app-label">{t('labels.businessName')}</label>
              <input
                className="app-input"
                required
                value={form.businessName}
                onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
                placeholder={t('placeholders.businessName')}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="app-label">{t('labels.district')}</label>
                <input
                  className="app-input"
                  value={form.district}
                  onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))}
                  placeholder={t('placeholders.district')}
                />
              </div>
              <div>
                <label className="app-label">{t('labels.telegram')}</label>
                <input
                  className="app-input"
                  value={form.telegram}
                  onChange={(event) => setForm((current) => ({ ...current, telegram: event.target.value }))}
                  placeholder={t('placeholders.telegram')}
                />
              </div>
            </div>
          </div>
        ) : null}

        <button type="submit" className="app-button w-full" disabled={submitting}>
          {submitting ? t('messages.creatingAccount') : t('buttons.createAccount')}
        </button>
      </form>

      <p className="text-sm text-gray-400">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-green-300">
          {t('auth.loginHere')}
        </Link>
      </p>
    </div>
  );
}
