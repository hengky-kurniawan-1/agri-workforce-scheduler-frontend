import type { HybridStep } from '@/api/generated';

type Props = {
  steps: HybridStep[];
  title?: string;
};

export function DecisionTimeline({ steps, title = 'Hybrid pipeline (per task)' }: Props) {
  if (!steps.length) {
    return (
      <section className="rounded-lg border border-dashed border-soil-200 bg-white/80 p-4 text-center text-xs text-soil-500">
        No hybrid steps yet. Load assignments (recompute if needed).
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-soil-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-soil-900">{title}</h2>
      <ol className="relative mt-3 space-y-0 border-l border-soil-200 pl-5">
        {steps.map((step, i) => (
          <li
            key={`${step.task_id}-${i}`}
            className="animate-fade-in-up pb-6 last:pb-0"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border border-white bg-soil-400" />
            <p className="text-xs font-medium uppercase tracking-wide text-soil-500">Task {step.task_id}</p>
            <p className="mt-0.5 text-sm font-medium text-soil-900">LLM pick: {step.llm_agronomist_id}</p>
            <p className="mt-1 text-sm text-soil-700">{step.llm_reasoning}</p>
            <p className="mt-2 text-xs text-soil-600">
              OR-Tools: {step.ortools_feasible ? 'feasible' : 'not feasible'} · score{' '}
              {step.ortools_score.toFixed(2)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
