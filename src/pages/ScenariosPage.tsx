import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScenarioLoader } from '@/components/ScenarioLoader';
import {
  resolvedScenarioId,
  scenarioSearchParamNeedsReplace,
  urlSearchParamsWithScenario,
} from '@/lib/scenarioQuery';

export function ScenariosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scenarioId = resolvedScenarioId(searchParams);

  useEffect(() => {
    if (!scenarioSearchParamNeedsReplace(searchParams)) return;
    setSearchParams(urlSearchParamsWithScenario(searchParams, '1'), { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-soil-900">Scenarios</h1>
        <p className="mt-2 text-soil-600">
          Backend supports scenarios <code className="rounded bg-soil-100 px-1.5 py-0.5 text-sm">1</code> and{' '}
          <code className="rounded bg-soil-100 px-1.5 py-0.5 text-sm">2</code> via{' '}
          <code className="rounded bg-soil-100 px-1.5 py-0.5 text-sm">GET /scenarios/&lt;sid&gt;</code>. Use the{' '}
          <code className="rounded bg-soil-100 px-1.5 py-0.5 text-sm">scenario</code> query parameter (e.g.{' '}
          <code className="rounded bg-soil-100 px-1.5 py-0.5 text-sm">?scenario=2</code>) or the Operations dashboard
          to switch scenarios.
        </p>
      </header>
      <ScenarioLoader scenarioId={scenarioId} />
    </div>
  );
}
