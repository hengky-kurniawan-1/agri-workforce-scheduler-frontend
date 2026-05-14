import { useState, type FormEvent } from 'react';
import type { ChatMessage } from '@/api/generated';
import { useChat } from '@/api/hooks';

type Props = {
  onMapUpdated?: () => void;
};

export function ScenarioChatPanel({ onMapUpdated }: Props) {
  const { send, submitting, error } = useChat({ onMapUpdated });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || submitting) return;
    const userMsg: ChatMessage = { role: 'user', content };
    const next = [...messages, userMsg];
    setMessages(next);
    setDraft('');
    try {
      const res = await send(next);
      setMessages([...next, { role: 'assistant', content: res.reply }]);
    } catch {
      /* error surfaced via hook */
    }
  }

  return (
    <section className="rounded-2xl border border-soil-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
      <h2 className="font-display text-lg font-semibold text-soil-900">Assistant</h2>
      <p className="mt-1 text-xs text-soil-600">
        POST <code className="rounded bg-soil-100 px-1">/chat</code> — when the API returns{' '}
        <code className="rounded bg-soil-100 px-1">flags.map_updated</code>, assignments reload so the map updates.
      </p>

      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto rounded-xl border border-soil-200/80 bg-soil-50/40 p-3 text-sm">
        {messages.length === 0 ? (
          <p className="text-soil-500">Ask about the schedule or scenario…</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
              className={`rounded-lg px-3 py-2 ${
                m.role === 'user' ? 'ml-6 bg-leaf-100/80 text-soil-900' : 'mr-6 bg-white text-soil-800 shadow-sm'
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-soil-500">{m.role}</p>
              <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
            </div>
          ))
        )}
      </div>

      <form className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={(e) => void handleSubmit(e)}>
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-soil-700">Message</span>
          <textarea
            className="min-h-[88px] resize-y rounded-xl border border-soil-300 bg-white px-3 py-2 text-soil-900 shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Describe what you want to change…"
            disabled={submitting}
            rows={3}
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !draft.trim()}
          className="rounded-xl bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-leaf-700 disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send'}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
