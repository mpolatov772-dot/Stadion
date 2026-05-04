import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { productService } from '../services/productService';
import { getProductCategoryLabelKey } from '../utils/display';
import { productCategories } from '../utils/options';

export function StorePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        setProducts(
          await productService.list({
            search: search || undefined,
            category: category || undefined,
          }),
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [search, category]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('storePage.eyebrow')}
        title={t('storePage.title')}
        description={t('storePage.description')}
        action={
          user?.role === 'seller' ? (
            <Link to="/dashboard" className="app-button">
              {t('buttons.manageProducts')}
            </Link>
          ) : null
        }
      />

      <section className="app-card grid gap-4 md:grid-cols-[1.2fr_0.8fr_auto]">
        <input
          className="app-input"
          placeholder={t('placeholders.searchProducts')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="app-input"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">{t('common.allCategories')}</option>
          {productCategories.map((item) => (
            <option key={item} value={item}>
              {t(getProductCategoryLabelKey(item))}
            </option>
          ))}
        </select>
        <button type="button" className="app-button-secondary" onClick={() => {
          setSearch('');
          setCategory('');
        }}>
          {t('common.reset')}
        </button>
      </section>

      {loading ? (
        <LoadingSpinner label={t('storePage.title')} />
      ) : products.length ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState title={t('empty.noProducts')} description={t('empty.noProductsDescription')} />
      )}
    </div>
  );
}
