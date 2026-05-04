import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { useI18n } from '../hooks/useI18n';
import { getCityLabelKey } from '../utils/display';

const icon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const uzbekistanCenter = [41.3775, 64.5853];
const uzbekistanBounds = [
  [37.0, 55.9],
  [45.8, 73.2],
];

export function MapSection({ stadiums = [] }) {
  const { t } = useI18n();
  const markers = stadiums.filter(
    (stadium) => stadium.location?.lat !== undefined && stadium.location?.lng !== undefined,
  );

  return (
    <div className="app-card overflow-hidden p-0">
      <div className="border-b border-white/5 px-5 py-4">
        <h3 className="heading-font text-2xl font-semibold text-white">{t('map.title')}</h3>
        <p className="mt-1 text-sm text-gray-400">
          {t('map.description')}
        </p>
      </div>
      <div className="h-[280px] sm:h-[360px] xl:h-[420px]">
        <MapContainer
          center={uzbekistanCenter}
          zoom={6}
          minZoom={5}
          maxZoom={15}
          maxBounds={uzbekistanBounds}
          className="h-full w-full"
        >
          <TileLayer
            attribution={t('map.attribution')}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((stadium) => (
            <Marker
              key={stadium._id}
              position={[stadium.location.lat, stadium.location.lng]}
              icon={icon}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">{stadium.name}</p>
                  <p>{t(getCityLabelKey(stadium.location.city))}</p>
                  <p>{stadium.location.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
