import { useEffect, useState } from 'react';

import { AnimatedSection } from '../components/AnimatedSection';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStadiums = async () => {
      setLoading(true);
      try {
        const data = await stadiumService.list({
          search: search || undefined,
          city: city || undefined,
        });
        setStadiums(data);
      } finally {
        setLoading(false);
      }
    };

    loadStadiums();
  }, [search, city]);

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
        }}>
          {t('common.reset')}
        </button>
      </AnimatedSection>

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
            <MapSection stadiums={stadiums} />
          </AnimatedSection>
        </div>
      )}
    </div>
  );
}
