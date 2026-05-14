import { useState } from 'react';
import { ScenarioLoader } from '@/components/ScenarioLoader';

const VALID = new Set(['1', '2']);

export function ScenariosPage() {
  const [id, setId] = useState('1');
  const [submitted, setSubmitted] = useState('1');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-soil-900">Scenarios</h1>
        <p className="mt-2 text-soil-600">
          Backend supports scenarios <code className="rounded bg-soil-100 px-1.5 py-0.5 text-sm">1</code> and{' '}
          <code className="rounded bg-soil-100 px-1.5 py-0.5 text-sm">2</code> via{' '}
          <code className="rounded bg-soil-100 px-1.5 py-0.5 text-sm">GET /scenarios/&lt;sid&gt;</code>.
        </p>
      </header>
      <form
        className="mb-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const next = id.trim() || '1';
          setSubmitted(VALID.has(next) ? next : '1');
        }}
      >
        <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-soil-700">Scenario id</span>
          <select
            className="rounded-xl border border-soil-300 bg-white px-3 py-2 text-soil-900 shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200"
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            <option value="1">1 — normal day</option>
            <option value="2">2 — constraint conflict</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-xl bg-leaf-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-leaf-700"
        >
          Load
        </button>
      </form>
      <ScenarioLoader scenarioId={submitted} />
    </div>
  );
}
