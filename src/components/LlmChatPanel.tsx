import { useCallback, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { ChatMessage } from '@/api/generated';
import { useLlmChat } from '@/api/hooks';

export function LlmChatPanel() {
  const { send, submitting, error, clearError } = useLlmChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const handleSend = useCallback(async () => {
    const content = draft.trim();
    if (!content || submitting) return;

    const userMessage: ChatMessage = { role: 'user', content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft('');
    clearError();

    try {
      const reply = await send(nextMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      requestAnimationFrame(scrollToBottom);
    } catch {
      setMessages((prev) => (prev.length && prev[prev.length - 1]?.role === 'user' ? prev.slice(0, -1) : prev));
      requestAnimationFrame(scrollToBottom);
    }
  }, [clearError, draft, messages, scrollToBottom, send, submitting]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void handleSend();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    void handleSend();
  }

  function handleClear() {
    setMessages([]);
    setDraft('');
    clearError();
  }

  return (
    <section className="mt-8 rounded-2xl border border-soil-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-soil-900">Assistant</h2>
          <p className="mt-1 text-xs text-soil-600">
            POST <code className="rounded bg-soil-100 px-1">/chat</code> — multi-turn messages; Enter sends, Shift+Enter
            newline.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={submitting || (messages.length === 0 && !draft)}
          className="rounded-xl border border-soil-200 bg-white px-3 py-1.5 text-xs font-semibold text-soil-800 hover:bg-soil-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear conversation
        </button>
      </div>

      <div
        ref={listRef}
        className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-xl border border-soil-100 bg-soil-50/40 p-3"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <p className="text-center text-sm text-soil-500">Ask about scheduling, tasks, or agronomists.</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-md bg-leaf-600 px-3 py-2 text-sm text-white shadow-sm'
                    : 'max-w-[85%] rounded-2xl rounded-bl-md border border-soil-200 bg-white px-3 py-2 text-sm text-soil-800 shadow-sm'
                }
              >
                <span className="sr-only">{m.role === 'user' ? 'You: ' : 'Assistant: '}</span>
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <form className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
        <label className="flex min-h-[88px] flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-soil-700">Message</span>
          <textarea
            className="min-h-[88px] resize-y rounded-xl border border-soil-300 bg-white px-3 py-2 text-soil-900 shadow-sm focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200 disabled:opacity-50"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={submitting}
            placeholder="Type a message…"
            rows={3}
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !draft.trim()}
          className="rounded-xl bg-soil-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-soil-900 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
        >
          {submitting ? 'Sending…' : 'Send'}
        </button>
      </form>

      {error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
