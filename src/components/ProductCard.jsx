import { Link } from 'react-router-dom';

import { useI18n } from '../hooks/useI18n';
import { getProductCategoryLabelKey } from '../utils/display';
import { formatCurrency } from '../utils/formatters';
import { productPlaceholderImage } from '../utils/placeholders';

export function ProductCard({ product }) {
  const { t } = useI18n();

  return (
    <article className="app-card football-card overflow-hidden p-0">
      <img
        src={product.images?.[0] || productPlaceholderImage}
        alt={product.name}
        className="h-48 w-full object-cover transition duration-500 hover:scale-105"
      />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="app-badge">{t(getProductCategoryLabelKey(product.category))}</span>
            <h3 className="mt-3 heading-font text-2xl font-semibold text-white">{product.name}</h3>
          </div>
          {product.featured ? <span className="text-xs text-green-300">{t('cards.featured')}</span> : null}
        </div>
        <p className="line-clamp-3 text-sm text-gray-400">{product.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>{t('cards.inStock', { count: product.stock })}</span>
          <span className="text-lg font-semibold text-green-300">{formatCurrency(product.price)}</span>
        </div>
        <Link to={`/store/${product._id}`} className="app-button w-full">
          {t('buttons.viewProduct')}
        </Link>
      </div>
    </article>
  );
}
