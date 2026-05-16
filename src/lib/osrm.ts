const DEFAULT_OSRM_URL = 'https://router.project-osrm.org';

type LatLng = { lat: number; lng: number };

type OsrmRouteResponse = {
  routes?: Array<{
    geometry?: {
      type?: string;
      coordinates?: [number, number][];
    };
  }>;
};

function osrmBaseUrl(): string {
  const url = import.meta.env.VITE_OSRM_URL?.replace(/\/$/, '');
  return url || DEFAULT_OSRM_URL;
}

/**
 * Fetch a driving route polyline from OSRM.
 * Returns Leaflet `[lat, lng][]` or `null` on failure.
 */
export async function fetchDrivingRoute(
  stops: LatLng[],
  signal?: AbortSignal
): Promise<[number, number][] | null> {
  if (stops.length < 2) return null;

  const coords = stops.map((s) => `${s.lng},${s.lat}`).join(';');
  const url = `${osrmBaseUrl()}/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    return null;
  }

  if (!res.ok) return null;

  let data: OsrmRouteResponse;
  try {
    data = (await res.json()) as OsrmRouteResponse;
  } catch {
    return null;
  }

  const coordinates = data.routes?.[0]?.geometry?.coordinates;
  if (!coordinates?.length) return null;

  return coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
}
