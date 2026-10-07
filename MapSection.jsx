import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LocationSearchInput } from './LocationSearchInput';
import { MapBaseLayers } from './MapBaseLayers';
import { UzbekistanMask } from './UzbekistanMask';
import { useI18n } from '../hooks/useI18n';
import { locationService } from '../services/locationService';
import { getCityLabelKey } from '../utils/display';
import {
  MAP_DARK_BACKGROUND,
  MAP_MAX_ZOOM,
  UZBEKISTAN_BOUNDS,
  UZBEKISTAN_CENTER,
} from '../utils/mapConfig';

// Brand-green pulsing pin for the platform's own stadiums — the loudest thing on
// the dark map, and easy to tell apart from the muted OpenStreetMap pitches.
const stadiumIcon = L.divIcon({
  className: 'stadium-marker',
  html:
    '<div style="position:relative;width:22px;height:22px;">' +
    '<span class="pin-pulse"></span>' +
    '<div style="position:relative;display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:9999px;background:linear-gradient(160deg,#4ade80,#16a34a);border:2px solid rgba(255,255,255,0.92);box-shadow:0 0 0 4px rgba(34,197,94,0.22),0 4px 10px rgba(0,0,0,0.6);font-size:11px;line-height:1;">&#9917;</div>' +
    '</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

// Quieter marker for real mini-stadiums pulled from OpenStreetMap.
const pitchIcon = L.divIcon({
  className: 'pitch-marker',
  html:
    '<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:rgba(15,23,32,0.92);border:2px solid rgba(96,165,250,0.85);box-shadow:0 3px 8px rgba(0,0,0,0.5);font-size:12px;line-height:1;">&#9917;</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

// Only fetch mini-stadiums once the viewport is small enough to be useful.
const PITCH_MIN_ZOOM = 13;
const PITCH_GRID = 0.02;
const snapKey = (bounds) => {
  const s = Math.floor(bounds.getSouth() / PITCH_GRID);
  const w = Math.floor(bounds.getWest() / PITCH_GRID);
  const n = Math.ceil(bounds.getNorth() / PITCH_GRID);
  const e = Math.ceil(bounds.getEast() / PITCH_GRID);
  return `${s},${w},${n},${e}`;
};

const uzbekistanCenter = [UZBEKISTAN_CENTER.lat, UZBEKISTAN_CENTER.lng];

const buildPlaceLabel = (result) => {
  const parts = [result.street, result.city].filter(Boolean);

  if (parts.length) {
    return parts.join(', ');
  }

  return String(result.displayName || '').split(',')[0].trim();
};

function MapFocus({ focus }) {
  const map = useMap();
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!focus) return;

    const previous = previousFocusRef.current;

    if (previous && previous.lat === focus.lat && previous.lng === focus.lng) {
      return;
    }

    previousFocusRef.current = focus;
    map.flyTo([focus.lat, focus.lng], 16, { animate: true, duration: 1.2 });
  }, [map, focus]);

  return null;
}

// Frames the platform's stadiums so they are visible right away instead of
// leaving the user on the whole-country view. Skipped while an explicit focus
// (page filter or map search) is driving the camera.
function FitStadiums({ points, enabled }) {
  const map = useMap();
  const key = points.map((point) => `${point.lat},${point.lng}`).join('|');

  useEffect(() => {
    if (!enabled || !points.length) return;

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15, { animate: true });
      return;
    }

    map.fitBounds(
      points.map((point) => [point.lat, point.lng]),
      { padding: [48, 48], maxZoom: 13, animate: true },
    );
    // `key` stands in for the point list so we only refit when it really changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, enabled, key]);

  return null;
}

// Shows real football pitches / mini-stadiums (from OpenStreetMap) for the
// current viewport, refreshing as the user pans once zoomed in close enough.
function PitchLayer() {
  const { t } = useI18n();
  const map = useMap();
  const [pitches, setPitches] = useState([]);
  const debounceRef = useRef(null);
  const lastKeyRef = useRef(null);
  const requestIdRef = useRef(0);

  const load = useCallback(() => {
    if (map.getZoom() < PITCH_MIN_ZOOM) {
      lastKeyRef.current = null;
      setPitches([]);
      return;
    }

    const bounds = map.getBounds();
    const key = snapKey(bounds);

    // Skip refetching while the viewport stays within the same grid cell.
    if (key === lastKeyRef.current) {
      return;
    }

    lastKeyRef.current = key;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    locationService
      .pitches({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      })
      .then((data) => {
        if (requestId === requestIdRef.current) {
          setPitches(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (requestId === requestIdRef.current) {
          setPitches([]);
        }
      });
  }, [map]);

  useMapEvents({
    moveend: () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(load, 600);
    },
  });

  useEffect(() => {
    load();
    return () => clearTimeout(debounceRef.current);
  }, [load]);

  return pitches.map((pitch) => (
    <Marker key={pitch.id} position={[pitch.lat, pitch.lng]} icon={pitchIcon}>
      <Tooltip direction="top" offset={[0, -14]} className="map-label" opacity={1}>
        {pitch.name || t('map.miniStadium')}
      </Tooltip>
      <Popup>
        <p className="font-semibold text-white">{pitch.name || t('map.miniStadium')}</p>
        <p className="text-xs text-gray-400">{t('map.miniStadium')}</p>
      </Popup>
    </Marker>
  ));
}

export function MapSection({ stadiums = [], focus = null, searchable = true }) {
  const { t } = useI18n();
  const [searchPlace, setSearchPlace] = useState(null);

  const markers = useMemo(
    () =>
      stadiums.filter(
        (stadium) => stadium.location?.lat !== undefined && stadium.location?.lng !== undefined,
      ),
    [stadiums],
  );

  const markerPoints = useMemo(
    () => markers.map((stadium) => ({ lat: stadium.location.lat, lng: stadium.location.lng })),
    [markers],
  );

  // Latest navigation wins: a new external focus (page filters) clears the
  // on-map search pin, and picking a search result overrides the focus below.
  const focusKey = focus ? `${focus.lat},${focus.lng}` : '';
  useEffect(() => {
    setSearchPlace(null);
  }, [focusKey]);

  const activeFocus = searchPlace ? { lat: searchPlace.lat, lng: searchPlace.lng } : focus;

  const handleSearchSelect = (result) => {
    setSearchPlace({
      lat: result.lat,
      lng: result.lng,
      label: buildPlaceLabel(result),
    });
  };

  return (
    <div className="app-card overflow-hidden p-0">
      <div className="border-b border-white/5 bg-gradient-to-br from-green-500/[0.07] via-transparent to-transparent px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="heading-font text-2xl font-semibold text-white">{t('map.title')}</h3>
            <p className="mt-1 text-sm text-gray-400">{t('map.description')}</p>
          </div>
          {markers.length ? (
            <span className="app-badge shrink-0">⚽ {markers.length}</span>
          ) : null}
        </div>
        {searchable ? (
          <p className="mt-3 text-xs text-green-300/80">{t('map.pitchHint')}</p>
        ) : null}
      </div>
      <div className="relative h-[68vh] max-h-[560px] min-h-[360px] sm:h-[440px] xl:h-[520px]">
        {searchable ? (
          <div className="absolute left-3 right-[4.25rem] top-3 z-[1000] sm:right-auto sm:w-80">
            <LocationSearchInput
              placeholder={t('map.searchPlaceholder')}
              onSelect={handleSearchSelect}
            />
          </div>
        ) : null}
        {searchable ? (
          <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-col gap-1.5 rounded-xl border border-white/10 bg-[#090d12]/90 px-2.5 py-2 text-[0.65rem] text-gray-300 shadow-lg backdrop-blur-md sm:px-3 sm:text-[0.68rem]">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />
              {t('map.legendStadiums')}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-blue-400 bg-[#0f1720]" />
              {t('map.legendPitches')}
            </span>
          </div>
        ) : null}
        <MapContainer
          center={uzbekistanCenter}
          zoom={6}
          minZoom={5}
          maxZoom={MAP_MAX_ZOOM}
          maxBounds={UZBEKISTAN_BOUNDS}
          maxBoundsViscosity={1}
          zoomControl={false}
          className="h-full w-full"
          style={{ backgroundColor: MAP_DARK_BACKGROUND }}
        >
          {/* Bottom-right keeps the zoom buttons clear of the search field. */}
          <ZoomControl position="bottomright" />
          <MapBaseLayers defaultLayer="dark" />
          <UzbekistanMask />
          <MapFocus focus={activeFocus} />
          <FitStadiums points={markerPoints} enabled={!activeFocus} />
          {searchable ? <PitchLayer /> : null}
          {searchPlace ? (
            <CircleMarker
              center={[searchPlace.lat, searchPlace.lng]}
              radius={10}
              pathOptions={{ color: '#4ade80', fillColor: '#4ade80', fillOpacity: 0.5, weight: 2 }}
            >
              <Popup>
                <p className="font-semibold">{searchPlace.label}</p>
              </Popup>
            </CircleMarker>
          ) : null}
          {markers.map((stadium) => (
            <Marker
              key={stadium._id}
              position={[stadium.location.lat, stadium.location.lng]}
              icon={stadiumIcon}
              zIndexOffset={500}
            >
              <Tooltip direction="top" offset={[0, -16]} className="map-label" opacity={1}>
                {stadium.name}
              </Tooltip>
              <Popup>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{stadium.name}</p>
                  <p className="text-xs font-medium text-green-300">
                    {t(getCityLabelKey(stadium.location.city))}
                  </p>
                  <p className="text-xs text-gray-400">{stadium.location.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
