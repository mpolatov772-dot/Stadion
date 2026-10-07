import { LayerGroup, LayersControl, TileLayer } from 'react-leaflet';

import { useI18n } from '../hooks/useI18n';
import {
  DARK_ATTRIBUTION,
  DARK_TILE_URL,
  MAP_MAX_NATIVE_ZOOM,
  MAP_MAX_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  SATELLITE_ATTRIBUTION,
  SATELLITE_LABELS_URL,
  SATELLITE_TILE_URL,
} from '../utils/mapConfig';

const { BaseLayer } = LayersControl;

// Shared base layers for every map. `defaultLayer` picks which one starts
// selected: "dark" (black Google-Maps-style overview) or "satellite" (rooftops
// visible, best for placing a stadium). Street stays as a plain fallback.
export function MapBaseLayers({ defaultLayer = 'satellite' }) {
  const { t } = useI18n();

  return (
    <LayersControl position="topright">
      <BaseLayer checked={defaultLayer === 'dark'} name={t('map.layers.dark')}>
        <TileLayer
          url={DARK_TILE_URL}
          attribution={DARK_ATTRIBUTION}
          subdomains="abcd"
          maxZoom={MAP_MAX_ZOOM}
          noWrap
        />
      </BaseLayer>
      <BaseLayer checked={defaultLayer === 'satellite'} name={t('map.layers.satellite')}>
        <LayerGroup>
          <TileLayer
            url={SATELLITE_TILE_URL}
            attribution={SATELLITE_ATTRIBUTION}
            maxNativeZoom={MAP_MAX_NATIVE_ZOOM}
            maxZoom={MAP_MAX_ZOOM}
            noWrap
          />
          <TileLayer
            url={SATELLITE_LABELS_URL}
            maxNativeZoom={MAP_MAX_NATIVE_ZOOM}
            maxZoom={MAP_MAX_ZOOM}
            noWrap
          />
        </LayerGroup>
      </BaseLayer>
      <BaseLayer checked={defaultLayer === 'street'} name={t('map.layers.street')}>
        <TileLayer
          url={OSM_TILE_URL}
          attribution={OSM_ATTRIBUTION}
          maxZoom={MAP_MAX_ZOOM}
          noWrap
        />
      </BaseLayer>
    </LayersControl>
  );
}
