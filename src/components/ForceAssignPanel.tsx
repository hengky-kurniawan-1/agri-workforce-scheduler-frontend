import { useState, type FormEvent } from 'react';
import type { Agronomist } from '@/api/generated';
import { useForceAssign } from '@/api/hooks';

type Props = {
  sid: string;
  agronomists: Agronomist[];
  selectedTaskId: string | null;
  onSuccess: () => void;
};

export function ForceAssignPanel({ sid, agronomists, selectedTaskId, onSuccess }: Props) {
  const { mutate, submitting, error } = useForceAssign(sid);
  const [agronomistId, setAgronomistId] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedTaskId || !agronomistId) return;
    try {
      await mutate({ task_id: selectedTaskId, agronomist_id: agronomistId });
      setAgronomistId('');
      onSuccess();
    } catch {
      /* error surfaced below */
    }
  }

  return (
    <section className="rounded-lg border border-soil-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-soil-900">Force assign</h3>
      <p className="mt-1 text-[11px] text-soil-500">
        Override solver for the selected task ·{' '}
        <code className="rounded bg-soil-100 px-0.5 font-mono text-[10px]">POST /scenarios/{sid}/force-assign</code>
      </p>
      <form className="mt-3 flex flex-col gap-2" onSubmit={(e) => void handleSubmit(e)}>
        <label className="flex min-w-0 flex-col gap-1 text-xs">
          <span className="font-medium text-soil-600">Agronomist</span>
          <select
            className="rounded-md border border-soil-200 bg-white px-3 py-2 text-sm text-soil-900 focus:border-soil-400 focus:outline-none focus:ring-1 focus:ring-soil-300"
            value={agronomistId}
            onChange={(e) => setAgronomistId(e.target.value)}
            disabled={!selectedTaskId || submitting}
          >
            <option value="">Select…</option>
            {agronomists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={submitting || !selectedTaskId || !agronomistId}
          className="rounded-md bg-soil-900 px-4 py-2 text-xs font-medium text-white hover:bg-soil-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Force assign'}
        </button>
      </form>
      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
