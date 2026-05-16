import { useEffect, useMemo, useState } from 'react';
import type { AgronomistRoutePlan } from '@/lib/routeGeometry';
import { getCachedDrivingRoute } from '@/lib/osrmCache';
import { fetchDrivingRoute } from '@/lib/osrm';

export type OsrmRouteStatus = 'idle' | 'loading' | 'ok' | 'fallback';

export type OsrmRouteResult = {
  roadPositions?: [number, number][];
  status: OsrmRouteStatus;
};

const MAX_CONCURRENT = 3;

export function useOsrmRoutes(routes: AgronomistRoutePlan[]): {
  byAgronomistId: Map<string, OsrmRouteResult>;
  aggregateStatus: OsrmRouteStatus;
} {
  const [byAgronomistId, setByAgronomistId] = useState<Map<string, OsrmRouteResult>>(() => new Map());

  useEffect(() => {
    const routable = routes.filter((r) => r.stops.length >= 2);
    if (routable.length === 0) {
      setByAgronomistId(new Map());
      return;
    }

    const initial = new Map<string, OsrmRouteResult>();
    const toFetch: AgronomistRoutePlan[] = [];

    for (const r of routable) {
      const stops = r.stops.map((s) => ({ lat: s.lat, lng: s.lng }));
      const cached = getCachedDrivingRoute(stops);
      if (cached) {
        initial.set(r.agronomistId, { roadPositions: cached, status: 'ok' });
      } else {
        initial.set(r.agronomistId, { status: 'loading' });
        toFetch.push(r);
      }
    }
    setByAgronomistId(initial);

    if (toFetch.length === 0) return;

    const controller = new AbortController();
    const { signal } = controller;

    let cancelled = false;

    async function fetchOne(route: AgronomistRoutePlan): Promise<OsrmRouteResult> {
      const stops = route.stops.map((s) => ({ lat: s.lat, lng: s.lng }));
      try {
        const roadPositions = await fetchDrivingRoute(stops, signal);
        if (roadPositions) return { roadPositions, status: 'ok' };
        return { status: 'fallback' };
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          throw err;
        }
        return { status: 'fallback' };
      }
    }

    async function run() {
      const next = new Map(initial);
      let index = 0;

      async function worker() {
        while (index < toFetch.length) {
          if (signal.aborted) return;
          const i = index++;
          const route = toFetch[i];
          if (!route) continue;
          const result = await fetchOne(route);
          if (!signal.aborted) {
            next.set(route.agronomistId, result);
          }
        }
      }

      const workers = Array.from({ length: Math.min(MAX_CONCURRENT, toFetch.length) }, () =>
        worker()
      );

      try {
        await Promise.all(workers);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        throw err;
      }

      if (!cancelled && !signal.aborted) {
        setByAgronomistId(next);
      }
    }

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [routes]);

  const aggregateStatus = useMemo((): OsrmRouteStatus => {
    if (routes.every((r) => r.stops.length < 2)) return 'idle';
    const statuses = [...byAgronomistId.values()].map((v) => v.status);
    if (statuses.length === 0) return 'loading';
    if (statuses.some((s) => s === 'loading')) return 'loading';
    if (statuses.every((s) => s === 'ok')) return 'ok';
    return 'fallback';
  }, [routes, byAgronomistId]);

  return { byAgronomistId, aggregateStatus };
}
