import { LocateFixed, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AnimatedSection } from '../components/AnimatedSection';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LocationSearchInput } from '../components/LocationSearchInput';
import { MapSection } from '../components/MapSection';
import { PageHeader } from '../components/PageHeader';
import { StadiumCard } from '../components/StadiumCard';
import { useI18n } from '../hooks/useI18n';
import { stadiumService } from '../services/stadiumService';
import { getCityLabelKey } from '../utils/display';
import { uzbekistanCities } from '../utils/options';

export function StadiumsPage() {
  const { t } = useI18n();
  const [stadiums, setStadiums] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [near, setNear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStadiums = async () => {
      setLoading(true);
      try {
        const data = await stadiumService.list({
          search: search || undefined,
          city: near ? undefined : city || undefined,
          ...(near ? { lat: near.lat, lng: near.lng, radiusKm: 25 } : {}),
        });
        setStadiums(data);
      } finally {
        setLoading(false);
      }
    };

    loadStadiums();
  }, [search, city, near]);

  const handleLocationSelect = (result) => {
    const parts = [result.street, result.city].filter(Boolean);
    const label = parts.length
      ? parts.join(', ')
      : String(result.displayName || '').split(',')[0].trim();

    setCity('');
    setNear({ lat: result.lat, lng: result.lng, label });
  };

  const handleNearby = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCity('');
        setNear({
          lat: coords.latitude,
          lng: coords.longitude,
          label: 'Mening joylashuvim',
        });
      },
      () => {
        window.alert('Yaqin stadionlarni ko‘rsatish uchun lokatsiyaga ruxsat bering.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <PageHeader
          eyebrow={t('stadiumsPage.eyebrow')}
          title={t('stadiumsPage.title')}
          description={t('stadiumsPage.description')}
        />
      </AnimatedSection>

      <AnimatedSection as="section" className="app-card grid gap-4 md:grid-cols-[1.2fr_0.8fr_auto]" delay={80}>
        <LocationSearchInput
          className="md:col-span-3"
          placeholder={t('placeholders.addressSearch')}
          onSelect={handleLocationSelect}
        />
        <input
          className="app-input"
          placeholder={t('placeholders.searchStadiums')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="app-input" value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">{t('common.allCities')}</option>
          {uzbekistanCities.map((option) => (
            <option key={option} value={option}>
              {t(getCityLabelKey(option))}
            </option>
          ))}
        </select>
        <button type="button" className="app-button-secondary" onClick={() => {
          setSearch('');
          setCity('');
          setNear(null);
        }}>
          {t('common.reset')}
        </button>
        <button type="button" className="app-button" onClick={handleNearby}>
          <LocateFixed className="h-4 w-4" />
          Atrofimdagi stadionlar
        </button>
      </AnimatedSection>

      {near ? (
        <span className="app-badge">
          {t('stadiumsPage.nearFilterLabel', { label: near.label })}
          <button
            type="button"
            className="ml-2 -mr-1 text-green-300 hover:text-green-100"
            aria-label={t('stadiumsPage.clearNearAria')}
            onClick={() => setNear(null)}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ) : null}

      {loading ? (
        <LoadingSpinner label={t('stadiumsPage.title')} />
      ) : (
        <div className="page-grid">
          <div className="space-y-6">
            {stadiums.length ? (
              <div className="grid gap-6 xl:grid-cols-2">
                {stadiums.map((stadium, index) => (
                  <AnimatedSection as="div" key={stadium._id} delay={index * 70}>
                    <StadiumCard stadium={stadium} />
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <EmptyState title={t('empty.noStadiumResults')} description={t('empty.noStadiumResultsDescription')} />
            )}
          </div>
          <AnimatedSection as="div" delay={120}>
            <MapSection stadiums={stadiums} focus={near ? { lat: near.lat, lng: near.lng } : null} />
          </AnimatedSection>
        </div>
      )}
    </div>
  );
}
