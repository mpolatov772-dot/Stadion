import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { LocationPicker } from '../components/LocationPicker';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { getApiErrorMessage } from '../utils/apiError';
import { uzbekistanCityCoordinates } from '../utils/options';
import { roleOptions } from '../utils/options';

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
    experience: '',
    businessCity: 'Tashkent',
    businessLat: uzbekistanCityCoordinates.Tashkent.lat,
    businessLng: uzbekistanCityCoordinates.Tashkent.lng,
  });
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  const requiresBusinessInfo = ['seller', 'stadiumOwner'].includes(form.role);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="app-label">{t('common.fullName')}</label>
          <input
            className="app-input"
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
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
        </div>

        {requiresBusinessInfo ? (
          <div className="space-y-4 rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-medium text-white">{t('common.businessInfo')}</p>
            <div>
              <label className="app-label">{t('labels.businessName')}</label>
              <input
                className="app-input"
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
            <div>
              <label className="app-label">{t('labels.experience')}</label>
              <input
                className="app-input"
                value={form.experience}
                onChange={(event) => setForm((current) => ({ ...current, experience: event.target.value }))}
                placeholder={t('placeholders.experience')}
              />
            </div>
            <LocationPicker
              city={form.businessCity}
              lat={form.businessLat}
              lng={form.businessLng}
              onChange={({ city, lat, lng }) =>
                setForm((current) => ({
                  ...current,
                  businessCity: city,
                  businessLat: lat,
                  businessLng: lng,
                }))
              }
              title={t('businessLocation.title')}
              description={t('businessLocation.description')}
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <label className="app-label">{t('labels.selectRole')}</label>
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
