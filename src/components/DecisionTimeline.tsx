import type { HybridStep } from '@/api/generated';

type Props = {
  steps: HybridStep[];
  title?: string;
};

export function DecisionTimeline({ steps, title = 'Hybrid pipeline (per task)' }: Props) {
  if (!steps.length) {
    return (
      <section className="rounded-2xl border border-dashed border-soil-200 bg-white/50 p-6 text-center text-sm text-soil-600">
        No hybrid steps yet. Load assignments (recompute if needed).
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-soil-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="font-display text-lg font-semibold text-soil-900">{title}</h2>
      <ol className="relative mt-4 space-y-0 border-l-2 border-leaf-200 pl-6">
        {steps.map((step, i) => (
          <li
            key={`${step.task_id}-${i}`}
            className="animate-fade-in-up pb-6 last:pb-0"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-white bg-leaf-500 shadow" />
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
