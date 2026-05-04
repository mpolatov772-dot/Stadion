import { useEffect, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';

import { LocationPicker } from './LocationPicker';
import { useI18n } from '../hooks/useI18n';
import { readFilesAsDataUrls } from '../utils/media';
import { defaultWorkingHours, weekdayOrder } from '../utils/workingHours';

const getInitialState = (initialValues) => ({
  city: initialValues?.location?.city || 'Tashkent',
  name: initialValues?.name || '',
  description: initialValues?.description || '',
  address: initialValues?.location?.address || '',
  lat: initialValues?.location?.lat ?? '',
  lng: initialValues?.location?.lng ?? '',
  price: initialValues?.price || 0,
  operationalCost: initialValues?.operationalCost || 0,
  images: initialValues?.images || [],
  equipment: initialValues?.equipment || [],
  workingHours: initialValues?.workingHours || defaultWorkingHours,
});

const normalizeTimeInput = (value = '') => {
  const cleaned = String(value).replace(/[^\d:]/g, '').slice(0, 5);

  if (!cleaned) {
    return '';
  }

  if (!cleaned.includes(':')) {
    if (cleaned.length <= 2) {
      return cleaned;
    }

    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
  }

  const [hours = '', minutes = ''] = cleaned.split(':');
  return `${hours.slice(0, 2)}:${minutes.slice(0, 2)}`;
};

const finalizeTimeInput = (value = '') => {
  const [hours = '', minutes = ''] = normalizeTimeInput(value).split(':');

  if (hours === '' || minutes === '') {
    return value;
  }

  return `${String(Number(hours || 0)).padStart(2, '0')}:${String(Number(minutes || 0)).padStart(2, '0')}`;
};

export function StadiumForm({
  initialValues,
  onSubmit,
  busy,
  submitLabel,
  onCancelEdit,
}) {
  const { t } = useI18n();
  const [form, setForm] = useState(getInitialState(initialValues));
  const [equipmentInput, setEquipmentInput] = useState('');

  useEffect(() => {
    setForm(getInitialState(initialValues));
  }, [initialValues]);

  const addEquipment = () => {
    if (!equipmentInput.trim()) return;
    setForm((current) => ({
      ...current,
      equipment: [...current.equipment, equipmentInput.trim()],
    }));
    setEquipmentInput('');
  };

  const handleWorkingDayChange = (weekday, field, value) => {
    setForm((current) => ({
      ...current,
      workingHours: {
        ...current.workingHours,
        [weekday]: {
          ...current.workingHours[weekday],
          [field]: ['startTime', 'endTime'].includes(field) ? normalizeTimeInput(value) : value,
        },
      },
    }));
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

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description,
      images: form.images,
      location: {
        city: form.city,
        address: form.address,
        lat: Number(form.lat),
        lng: Number(form.lng),
      },
      price: Number(form.price),
      operationalCost: Number(form.operationalCost),
      workingHours: form.workingHours,
      equipment: form.equipment,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="app-card space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="heading-font text-2xl font-semibold text-white">
            {initialValues ? t('buttons.updateStadium') : t('buttons.createStadium')}
          </h3>
          <p className="mt-1 text-sm text-gray-400">{t('forms.stadium.description')}</p>
        </div>
        {onCancelEdit ? (
          <button type="button" onClick={onCancelEdit} className="app-button-secondary">
            {t('common.cancel')}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="app-label">{t('labels.stadiumName')}</label>
          <input
            className="app-input"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder={t('placeholders.stadiumName')}
          />
        </div>
        <div className="md:col-span-2">
          <label className="app-label">{t('common.description')}</label>
          <textarea
            className="app-input min-h-28"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder={t('placeholders.stadiumDescription')}
          />
        </div>
        <div>
          <label className="app-label">{t('labels.address')}</label>
          <input
            className="app-input"
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            placeholder={t('placeholders.address')}
          />
        </div>
        <div>
          <label className="app-label">{t('labels.pricePerSlot')}</label>
          <input
            type="number"
            className="app-input"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          />
        </div>
        <div>
          <label className="app-label">{t('labels.operationalCost')}</label>
          <input
            type="number"
            className="app-input"
            value={form.operationalCost}
            onChange={(event) =>
              setForm((current) => ({ ...current, operationalCost: event.target.value }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <LocationPicker
            city={form.city}
            lat={form.lat}
            lng={form.lng}
            onChange={({ city, lat, lng }) =>
              setForm((current) => ({
                ...current,
                city,
                lat,
                lng,
              }))
            }
            title={t('stadiumForm.cityOnlyTitle')}
            description={t('stadiumForm.cityOnlyDescription')}
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
                <img src={item} alt={t('labels.stadiumName')} className="h-28 w-full object-cover" />
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
          <label className="app-label">{t('labels.equipment')}</label>
          <div className="flex gap-2">
            <input
              className="app-input"
              value={equipmentInput}
              onChange={(event) => setEquipmentInput(event.target.value)}
              placeholder={t('placeholders.equipment')}
            />
            <button type="button" onClick={addEquipment} className="app-button-secondary">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.equipment.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    equipment: current.equipment.filter((equipment) => equipment !== item),
                  }))
                }
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300"
              >
                {item} ×
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="app-label">{t('common.workingHours')}</label>
        <div className="space-y-3">
          {weekdayOrder.map((weekday) => (
            <div key={weekday} className="grid gap-3 rounded-2xl border border-white/10 p-4 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
              <label className="flex items-center gap-3 text-sm text-white">
                <input
                  type="checkbox"
                  checked={Boolean(form.workingHours[weekday]?.enabled)}
                  onChange={(event) => handleWorkingDayChange(weekday, 'enabled', event.target.checked)}
                />
                {t(`weekdays.${weekday}`)}
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="app-input"
                value={form.workingHours[weekday]?.startTime || '09:00'}
                placeholder="08:30"
                disabled={!form.workingHours[weekday]?.enabled}
                onChange={(event) => handleWorkingDayChange(weekday, 'startTime', event.target.value)}
                onBlur={(event) =>
                  handleWorkingDayChange(weekday, 'startTime', finalizeTimeInput(event.target.value))
                }
              />
              <input
                type="text"
                inputMode="numeric"
                className="app-input"
                value={form.workingHours[weekday]?.endTime || '23:00'}
                placeholder="23:00"
                disabled={!form.workingHours[weekday]?.enabled}
                onChange={(event) => handleWorkingDayChange(weekday, 'endTime', event.target.value)}
                onBlur={(event) =>
                  handleWorkingDayChange(weekday, 'endTime', finalizeTimeInput(event.target.value))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="app-button w-full" disabled={busy}>
        {busy ? t('common.save') + '...' : submitLabel || (initialValues ? t('buttons.updateStadium') : t('buttons.saveStadium'))}
      </button>
    </form>
  );
}
