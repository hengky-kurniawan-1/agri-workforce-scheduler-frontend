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
    <section className="rounded-2xl border border-soil-200/80 bg-white/70 p-5 shadow-sm">
      <h3 className="font-display text-base font-semibold text-soil-900">Force assign (override solver)</h3>
      <p className="mt-1 text-xs text-soil-600">
        POST <code className="rounded bg-soil-100 px-1">/scenarios/{sid}/force-assign</code> — requires a cached
        decision (load assignments first).
      </p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(e) => void handleSubmit(e)}>
        <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-soil-700">Agronomist</span>
          <select
            className="rounded-xl border border-soil-300 bg-white px-3 py-2 text-soil-900 shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200"
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
          className="rounded-xl bg-soil-800 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-soil-900 disabled:cursor-not-allowed disabled:opacity-50"
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
