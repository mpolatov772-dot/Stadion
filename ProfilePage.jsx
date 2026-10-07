import { CircleDollarSign, LayoutDashboard, Settings, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/apiError';
import { getRoleLabelKey } from '../utils/display';
import { readFileAsDataUrl } from '../utils/media';

export function ProfilePage() {
  const { t } = useI18n();
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    avatar: '',
    businessName: '',
    district: '',
    telegram: '',
  });
  const [saving, setSaving] = useState(false);
  const previewAvatar = form.avatar || user.avatar || '';
  const initials = String(form.fullName || user.fullName || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join('');
  const quickLinks = useMemo(() => {
    const shared = [{ to: '/settings', label: t('nav.settings'), icon: Settings }];

    if (user.role === 'stadiumOwner') {
      return [
        { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/owner/stats', label: t('nav.ownerStats'), icon: CircleDollarSign },
        ...shared,
      ];
    }

    if (user.role === 'admin') {
      return [
        { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/admin', label: t('nav.admin'), icon: ShieldCheck },
        ...shared,
      ];
    }

    return [{ to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard }, ...shared];
  }, [t, user.role]);

  useEffect(() => {
    setForm({
      fullName: user.fullName || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      businessName: user.businessProfile?.businessName || '',
      district: user.businessProfile?.district || '',
      telegram: user.businessProfile?.telegram || '',
    });
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile(form);
      await refreshUser();
      toast.success(t('messages.profileUpdated'));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t, 'errors.saveProfileFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setForm((current) => ({
      ...current,
      avatar: '',
    }));

    const dataUrl = await readFileAsDataUrl(file);
    setForm((current) => ({
      ...current,
      avatar: dataUrl,
    }));
    event.target.value = '';
  };

  const requiresBusinessInfo = user.role === 'stadiumOwner';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('profilePage.eyebrow')}
        title={t('profilePage.title')}
        description={t('profilePage.description')}
      />

      <div className="page-grid">
        <div className="app-card">
          {previewAvatar ? (
            <img src={previewAvatar} alt={user.fullName} className="h-24 w-24 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-green-500/15 text-2xl font-semibold text-green-300">
              {initials || '?'}
            </div>
          )}
          <h3 className="mt-4 heading-font text-3xl font-semibold text-white">{user.fullName}</h3>
          <p className="mt-2 text-sm text-gray-400">{user.email}</p>
          <p className="mt-2 app-badge">{t(getRoleLabelKey(user.role))}</p>

          <div className="mt-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Tez o‘tish</p>
            <div className="grid gap-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200"
                  >
                    <Icon className="h-4 w-4 text-green-300" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="app-card space-y-4">
          <div>
            <label className="app-label">{t('common.fullName')}</label>
            <input
              className="app-input"
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
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
          <div>
            <label className="app-label">{t('labels.profileAvatar')}</label>
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/15 px-4 py-4 text-sm text-gray-300">
              {t('buttons.uploadAvatar')}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          {requiresBusinessInfo ? (
            <>
              <div>
                <label className="app-label">{t('labels.businessName')}</label>
                <input
                  className="app-input"
                  value={form.businessName}
                  onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
                />
              </div>
              <div>
                <label className="app-label">{t('labels.district')}</label>
                <input
                  className="app-input"
                  value={form.district}
                  onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))}
                />
              </div>
              <div>
                <label className="app-label">{t('labels.telegram')}</label>
                <input
                  className="app-input"
                  value={form.telegram}
                  onChange={(event) => setForm((current) => ({ ...current, telegram: event.target.value }))}
                />
              </div>
            </>
          ) : null}
          <button type="submit" className="app-button w-full" disabled={saving}>
            {saving ? t('common.save') + '...' : t('buttons.saveProfile')}
          </button>
        </form>
      </div>
    </div>
  );
}
