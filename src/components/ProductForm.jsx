import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';

import { useI18n } from '../hooks/useI18n';
import { getProductCategoryLabelKey } from '../utils/display';
import { readFilesAsDataUrls } from '../utils/media';
import { productCategories } from '../utils/options';

const getInitialState = (initialValues) => ({
  name: initialValues?.name || '',
  category: initialValues?.category || productCategories[0],
  description: initialValues?.description || '',
  price: initialValues?.price || 0,
  stock: initialValues?.stock || 0,
  images: initialValues?.images || [],
  specs: initialValues?.specs || [],
  featured: Boolean(initialValues?.featured),
});

export function ProductForm({
  initialValues,
  onSubmit,
  busy,
  submitLabel,
  onCancelEdit,
}) {
  const { t } = useI18n();
  const [form, setForm] = useState(getInitialState(initialValues));
  const [specInput, setSpecInput] = useState('');

  useEffect(() => {
    setForm(getInitialState(initialValues));
  }, [initialValues]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    });
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    const dataUrls = await readFilesAsDataUrls(files);
    setForm((current) => ({ ...current, images: [...current.images, ...dataUrls] }));
    event.target.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="app-card space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="heading-font text-2xl font-semibold text-white">
            {initialValues ? t('forms.product.editTitle') : t('forms.product.createTitle')}
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {t('forms.product.description')}
          </p>
        </div>
        {onCancelEdit ? (
          <button type="button" onClick={onCancelEdit} className="app-button-secondary">
            {t('common.cancel')}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="app-label">{t('labels.productName')}</label>
          <input
            className="app-input"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder={t('placeholders.productName')}
          />
        </div>
        <div>
          <label className="app-label">{t('common.category')}</label>
          <select
            className="app-input"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({ ...current, category: event.target.value }))
            }
          >
            {productCategories.map((category) => (
              <option key={category} value={category}>
                {t(getProductCategoryLabelKey(category))}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="app-label">{t('labels.featuredListing')}</label>
          <label className="flex h-[52px] items-center gap-3 rounded-xl border border-white/10 px-4">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm((current) => ({ ...current, featured: event.target.checked }))
              }
            />
            <span className="text-sm text-gray-300">{t('cards.featured')}</span>
          </label>
        </div>
        <div className="md:col-span-2">
          <label className="app-label">{t('common.description')}</label>
          <textarea
            className="app-input min-h-28"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder={t('placeholders.productDescription')}
          />
        </div>
        <div>
          <label className="app-label">{t('labels.price')}</label>
          <input
            type="number"
            className="app-input"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          />
        </div>
        <div>
          <label className="app-label">{t('labels.stock')}</label>
          <input
            type="number"
            className="app-input"
            value={form.stock}
            onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="app-label">{t('labels.imageUrls')}</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-5 text-sm text-gray-300 transition hover:border-green-500/40 hover:bg-green-500/5">
            <Upload className="h-4 w-4 text-green-300" />
            {t('buttons.uploadImages')}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {form.images.map((item) => (
              <div key={item} className="overflow-hidden rounded-xl border border-white/10">
                <img src={item} alt={t('labels.productName')} className="h-28 w-full object-cover" />
                <div className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="truncate text-gray-300">{t('common.image')}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        images: current.images.filter((image) => image !== item),
                      }))
                    }
                    className="text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="app-label">{t('labels.specifications')}</label>
          <div className="flex gap-2">
            <input
              className="app-input"
              value={specInput}
              onChange={(event) => setSpecInput(event.target.value)}
              placeholder={t('placeholders.specification')}
            />
            <button
              type="button"
              className="app-button-secondary"
              onClick={() => {
                if (!specInput.trim()) return;
                setForm((current) => ({ ...current, specs: [...current.specs, specInput.trim()] }));
                setSpecInput('');
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.specs.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    specs: current.specs.filter((spec) => spec !== item),
                  }))
                }
              >
                {item} ×
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" className="app-button w-full" disabled={busy}>
        {busy
          ? t('common.save') + '...'
          : submitLabel || (initialValues ? t('buttons.updateProduct') : t('buttons.saveProduct'))}
      </button>
    </form>
  );
}
