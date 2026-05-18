import { type FormEvent, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/api/generated';
import { useChatContext } from '@/context/ChatContext';

type Props = {
	className?: string;
};

export function ScenarioChatPanel({ className }: Props) {
	const {
		messages,
		setMessages,
		send,
		submitting,
		sendError,
		historyLoading,
		historyError,
		shouldFetchHistory,
		conversationId,
		clearConversation,
	} = useChatContext();
	const [draft, setDraft] = useState('');
	const messagesRef = useRef<HTMLDivElement>(null);
	const showInitialHistoryLoading = historyLoading && messages.length === 0;
	const showEmptyHint = messages.length === 0 && !showInitialHistoryLoading;

	useEffect(() => {
		const el = messagesRef.current;
		if (!el || messages.length === 0) return;
		el.scrollTop = el.scrollHeight;
	}, [messages.length]);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const content = draft.trim();
		if (!content || submitting) return;

		const userMsg: ChatMessage = { role: 'user', content };
		setMessages((prev) => [...prev, userMsg]);
		setDraft('');

		try {
			const res = await send(content);
			setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
		} catch {
			setMessages((prev) => prev.slice(0, -1));
		}
	}

	const error = sendError ?? (shouldFetchHistory ? historyError : null);
	const busy = submitting || showInitialHistoryLoading;
	const canReset = messages.length > 0 || conversationId != null;

	function handleNewChat() {
		if (busy || !canReset) return;
		if (
			messages.length > 0 &&
			!window.confirm('Start a new chat? This clears the conversation in this tab.')
		) {
			return;
		}
		clearConversation();
		setDraft('');
	}

	return (
		<section
			className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-soil-200 bg-white p-4 ${className ?? ''}`}
		>
			<div className="flex shrink-0 items-start justify-between gap-2">
				<h2 className="text-sm font-semibold text-soil-900">Assistant</h2>
				<button
					type="button"
					onClick={handleNewChat}
					disabled={busy || !canReset}
					className="shrink-0 rounded-md border border-soil-200 bg-white px-2.5 py-1 text-[11px] font-medium text-soil-700 hover:bg-soil-50 disabled:opacity-50"
				>
					New chat
				</button>
			</div>
			<p className="mt-1 shrink-0 text-[11px] leading-snug text-soil-400">
				<code className="rounded bg-soil-100 px-0.5 font-mono text-[10px]">/chat</code>
				{` · `}
				History is kept for this browser tab. Use <span className="font-medium text-soil-500">New chat</span>{' '}
				to clear this thread; the next message starts a fresh conversation. Reloads assignments when{' '}
				<code className="rounded bg-soil-100 px-0.5 font-mono text-[10px]">map_updated</code> or{' '}
				<code className="rounded bg-soil-100 px-0.5 font-mono text-[10px]">schedule_updated</code>
			</p>

			<div
				ref={messagesRef}
				className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain rounded-md border border-soil-100 bg-soil-50/50 p-3 text-sm"
			>
				{showInitialHistoryLoading ? (
					<p className="text-xs text-soil-500">Loading conversation…</p>
				) : showEmptyHint ? (
					<p className="text-xs text-soil-500">
						Ask the assistant to change the schedule, add tasks, or reassign work.
					</p>
				) : (
					messages.map((m) => (
						<div
							key={`${m.role}:${m.content}`}
							className={`rounded-md px-3 py-2 text-sm ${
								m.role === 'user'
									? 'ml-4 bg-soil-100 text-soil-900'
									: 'mr-4 bg-white text-soil-800 ring-1 ring-soil-100'
							}`}
						>
							<p className="text-[10px] font-medium uppercase tracking-wide text-soil-400">
								{m.role}
							</p>
							<p className="mt-1 whitespace-pre-wrap">{m.content}</p>
						</div>
					))
				)}
			</div>

			<form className="mt-3 flex shrink-0 flex-col gap-2" onSubmit={(e) => void handleSubmit(e)}>
				<label className="flex shrink-0 flex-col gap-1 text-xs">
					<span className="font-medium text-soil-600">Message</span>
					<textarea
						className="min-h-[72px] resize-none rounded-md border border-soil-200 bg-white px-3 py-2 text-sm text-soil-900 placeholder:text-soil-400 focus:border-soil-400 focus:outline-none focus:ring-1 focus:ring-soil-300"
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						placeholder="Describe what you want to change…"
						disabled={busy}
						rows={2}
					/>
				</label>
				<button
					type="submit"
					disabled={busy || !draft.trim()}
					className="rounded-md bg-soil-900 px-4 py-2 text-xs font-medium text-white hover:bg-soil-800 disabled:opacity-50"
				>
					{submitting ? 'Sending…' : 'Send'}
				</button>
			</form>

			{error ? <p className="mt-2 shrink-0 text-xs text-red-600">{error}</p> : null}
		</section>
	);
}
