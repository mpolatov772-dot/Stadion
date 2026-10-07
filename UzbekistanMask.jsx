import { useEffect, useState } from 'react';
import { Polygon } from 'react-leaflet';

import { locationService } from '../services/locationService';
import { MAP_DARK_BACKGROUND } from '../utils/mapConfig';

// Covers the whole Web-Mercator world; Uzbekistan is punched out as holes (via
// Leaflet's even-odd fill) so only the country stays lit at any zoom level.
const OUTER_RING = [
  [85, -180],
  [85, 180],
  [-85, 180],
  [-85, -180],
];

const toLatLngRing = (ring) => ring.map(([lng, lat]) => [lat, lng]);

// Pull the outer ring of every polygon (ignore lake holes) from the boundary.
const extractOuterRings = (geojson) => {
  if (!geojson) {
    return [];
  }

  if (geojson.type === 'Polygon') {
    return [toLatLngRing(geojson.coordinates[0])];
  }

  if (geojson.type === 'MultiPolygon') {
    return geojson.coordinates.map((polygon) => toLatLngRing(polygon[0]));
  }

  return [];
};

export function UzbekistanMask() {
  const [rings, setRings] = useState([]);

  useEffect(() => {
    let cancelled = false;

    locationService
      .boundary()
      .then((geojson) => {
        if (!cancelled) {
          setRings(extractOuterRings(geojson));
        }
      })
      .catch(() => {
        // No boundary -> no mask; the map simply stays dark within its bounds.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!rings.length) {
    return null;
  }

  return (
    <>
      <Polygon
        positions={[OUTER_RING, ...rings]}
        pathOptions={{
          stroke: false,
          fillColor: MAP_DARK_BACKGROUND,
          fillOpacity: 0.92,
          interactive: false,
        }}
      />
      {rings.map((ring, index) => (
        <Polygon
          key={index}
          positions={ring}
          pathOptions={{ color: '#3b82f6', weight: 1.5, fill: false, interactive: false }}
        />
      ))}
    </>
  );
}
