export const UZBEKISTAN_CENTER = { lat: 41.3775, lng: 64.5853 };

export const UZBEKISTAN_BOUNDS = [
  [37.0, 55.9],
  [45.8, 73.2],
];

// Zoom levels: native tiles top out ~18-19, we allow a touch of overzoom so
// individual houses/yards stay selectable when placing a stadium marker.
export const MAP_MAX_NATIVE_ZOOM = 18;
export const MAP_MAX_ZOOM = 19;

// Dark map (CARTO Dark Matter) — black background, Google-Maps-dark style.
export const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const DARK_ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO';
// Painted behind the tiles so gaps/edges stay black instead of Leaflet grey.
export const MAP_DARK_BACKGROUND = '#0b0f1a';

// Street map (OpenStreetMap)
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors';

// Satellite imagery (Esri World Imagery) — free, buildings/houses visible at high
// zoom, same "see the actual rooftops" view as Google Maps satellite mode.
export const SATELLITE_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
export const SATELLITE_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

// Road/place labels drawn on top of the imagery for a Google-style hybrid view.
export const SATELLITE_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}';
