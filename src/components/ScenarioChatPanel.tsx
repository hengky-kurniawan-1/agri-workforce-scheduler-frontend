import { useState, type FormEvent } from 'react';
import type { ChatMessage, ChatUiFlags } from '@/api/generated';
import { useChat } from '@/api/hooks';

type Props = {
  onChatFlags?: (flags: ChatUiFlags) => void;
  className?: string;
};

export function ScenarioChatPanel({ onChatFlags, className }: Props) {
  const { send, submitting, error } = useChat({ onChatFlags });
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
    <section
      className={`flex min-h-0 flex-col rounded-lg border border-soil-200 bg-white p-4 ${className ?? ''}`}
    >
      <h2 className="shrink-0 text-sm font-semibold text-soil-900">Assistant</h2>
      <p className="mt-1 shrink-0 text-[11px] leading-snug text-soil-400">
        <code className="rounded bg-soil-100 px-0.5 font-mono text-[10px]">/chat</code>
        {` · `}
        Reloads assignments when{' '}
        <code className="rounded bg-soil-100 px-0.5 font-mono text-[10px]">map_updated</code> or{' '}
        <code className="rounded bg-soil-100 px-0.5 font-mono text-[10px]">schedule_updated</code>
      </p>

      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto rounded-md border border-soil-100 bg-soil-50/50 p-3 text-sm">
        {messages.length === 0 ? (
          <p className="text-xs text-soil-500">Ask about the schedule or scenario…</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
              className={`rounded-md px-3 py-2 text-sm ${
                m.role === 'user' ? 'ml-4 bg-soil-100 text-soil-900' : 'mr-4 bg-white text-soil-800 ring-1 ring-soil-100'
              }`}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-soil-400">{m.role}</p>
              <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
            </div>
          ))
        )}
      </div>

      <form className="mt-3 flex shrink-0 flex-col gap-2" onSubmit={(e) => void handleSubmit(e)}>
        <label className="flex min-h-0 flex-1 flex-col gap-1 text-xs">
          <span className="font-medium text-soil-600">Message</span>
          <textarea
            className="min-h-[72px] resize-y rounded-md border border-soil-200 bg-white px-3 py-2 text-sm text-soil-900 placeholder:text-soil-400 focus:border-soil-400 focus:outline-none focus:ring-1 focus:ring-soil-300"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Describe what you want to change…"
            disabled={submitting}
            rows={2}
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !draft.trim()}
          className="rounded-md bg-soil-900 px-4 py-2 text-xs font-medium text-white hover:bg-soil-800 disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send'}
        </button>
      </form>

      {error ? <p className="mt-2 shrink-0 text-xs text-red-600">{error}</p> : null}
    </section>
  );
}
