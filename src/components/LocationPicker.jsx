import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { useI18n } from '../hooks/useI18n';
import { getCityLabelKey } from '../utils/display';
import { uzbekistanCities, uzbekistanCityCoordinates } from '../utils/options';

const icon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const defaultCity = 'Tashkent';
const uzbekistanCenter = { lat: 41.3775, lng: 64.5853 };
const uzbekistanBounds = [
  [37.0, 55.9],
  [45.8, 73.2],
];

const getCityCoordinates = (city = defaultCity) =>
  uzbekistanCityCoordinates[city] || uzbekistanCityCoordinates[defaultCity];

const parseCoordinates = (lat, lng) => {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
    return null;
  }

  return { lat: parsedLat, lng: parsedLng };
};

function MapMover({ position }) {
  const map = useMap();
  map.setView(position, Math.max(map.getZoom(), 10), { animate: true });
  return null;
}

function ClickSelector({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

export function LocationPicker({
  city = defaultCity,
  lat,
  lng,
  onChange,
  title,
  description,
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(() => parseCoordinates(lat, lng));
  const [mapCenter, setMapCenter] = useState(() => parseCoordinates(lat, lng) || getCityCoordinates(city));

  useEffect(() => {
    const parsedCoordinates = parseCoordinates(lat, lng);

    if (parsedCoordinates) {
      setSelectedPosition(parsedCoordinates);
      setMapCenter(parsedCoordinates);
      return;
    }

    setSelectedPosition(null);
    setMapCenter(getCityCoordinates(city) || uzbekistanCenter);
  }, [city, lat, lng]);

  const filteredCities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return uzbekistanCities;
    }

    return uzbekistanCities.filter((item) =>
      t(getCityLabelKey(item)).toLowerCase().includes(normalizedQuery),
    );
  }, [query, t]);

  const handleCitySelect = (nextCity) => {
    const coordinates = getCityCoordinates(nextCity);
    setMapCenter(coordinates);
    onChange({
      city: nextCity,
      lat: selectedPosition?.lat ?? '',
      lng: selectedPosition?.lng ?? '',
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 p-4">
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        {description ? <p className="mt-1 text-sm text-gray-400">{description}</p> : null}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-green-300" />
        <input
          className="app-input pl-11"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('placeholders.locationSearch')}
        />
      </div>

      <select
        className="app-input"
        value={city}
        onChange={(event) => handleCitySelect(event.target.value)}
      >
        {filteredCities.map((item) => (
          <option key={item} value={item}>
            {t(getCityLabelKey(item))}
          </option>
        ))}
      </select>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="h-72">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={selectedPosition ? 11 : 6}
            minZoom={6}
            maxZoom={16}
            maxBounds={uzbekistanBounds}
            maxBoundsViscosity={1}
            className="h-full w-full"
          >
            <TileLayer
              attribution={t('map.attribution')}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap
            />
            <MapMover position={[mapCenter.lat, mapCenter.lng]} />
            <ClickSelector
              onSelect={(position) => {
                setSelectedPosition(position);
                setMapCenter(position);
                onChange({
                  city,
                  lat: position.lat,
                  lng: position.lng,
                });
              }}
            />
            {selectedPosition ? (
              <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={icon} />
            ) : null}
          </MapContainer>
        </div>
      </div>

      {selectedPosition ? (
        <p className="text-xs text-green-300">
          {t('stadiumForm.coordinatesAuto', {
            lat: selectedPosition.lat,
            lng: selectedPosition.lng,
          })}
        </p>
      ) : (
        <p className="text-xs text-amber-300">{t('stadiumForm.pickLocationHint')}</p>
      )}
    </div>
  );
}
