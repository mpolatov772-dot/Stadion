import { MapContainer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { LocationSearchInput } from './LocationSearchInput';
import { MapBaseLayers } from './MapBaseLayers';
import { useI18n } from '../hooks/useI18n';
import { getCityLabelKey } from '../utils/display';
import { MAP_MAX_ZOOM, UZBEKISTAN_BOUNDS, UZBEKISTAN_CENTER } from '../utils/mapConfig';
import { uzbekistanCities, uzbekistanCityCoordinates } from '../utils/options';

const icon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const defaultCity = 'Tashkent';

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
  const previousPositionRef = useRef(null);

  useEffect(() => {
    const [lat, lng] = position;
    const previous = previousPositionRef.current;

    if (previous && previous[0] === lat && previous[1] === lng) {
      return;
    }

    previousPositionRef.current = position;
    map.setView(position, Math.max(map.getZoom(), 10), { animate: true });
  }, [map, position]);

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
    setMapCenter(getCityCoordinates(city) || UZBEKISTAN_CENTER);
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

  const matchCityFromText = (text) => {
    if (!text) {
      return null;
    }

    const normalizedText = text.toLowerCase();

    return (
      uzbekistanCities.find((candidate) => {
        const label = t(getCityLabelKey(candidate)).toLowerCase();
        return normalizedText.includes(label) || candidate.toLowerCase().includes(normalizedText);
      }) || null
    );
  };

  const handleSearchSelect = (result) => {
    const position = { lat: result.lat, lng: result.lng };
    setSelectedPosition(position);
    setMapCenter(position);

    const matchedCity = matchCityFromText(result.city) || matchCityFromText(result.region);
    const address = result.street || String(result.displayName || '').split(',')[0].trim();

    onChange({
      city: matchedCity || city,
      lat: position.lat,
      lng: position.lng,
      address,
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 p-4">
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        {description ? <p className="mt-1 text-sm text-gray-400">{description}</p> : null}
      </div>

      <LocationSearchInput
        placeholder={t('placeholders.addressSearch')}
        onSelect={handleSearchSelect}
      />

      <div className="relative border-t border-white/10 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-green-300" />
          <input
            className="app-input pl-11"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('placeholders.locationSearch')}
          />
        </div>
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
            zoom={selectedPosition ? 16 : 6}
            minZoom={6}
            maxZoom={MAP_MAX_ZOOM}
            maxBounds={UZBEKISTAN_BOUNDS}
            maxBoundsViscosity={1}
            className="h-full w-full"
          >
            <MapBaseLayers />
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
