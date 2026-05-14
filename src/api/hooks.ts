import { useCallback, useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { ApiError } from './generated/core/ApiError';
import {
  getScenarioAssignmentsScenariosSidAssignmentsGet,
  getScenarioScenariosSidGet,
  postChatChatPost,
  postForceAssignScenariosSidForceAssignPost,
} from './generated';
import type { AssignmentsResult, ChatMessage, ForceAssignRequest, ScenarioInfo } from './generated';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as { detail?: string | Array<{ msg?: string }> } | undefined;
    if (body?.detail !== undefined) {
      if (typeof body.detail === 'string') return body.detail;
      if (Array.isArray(body.detail)) {
        return body.detail.map((d) => d.msg ?? JSON.stringify(d)).join('; ') || err.message;
      }
    }
    return err.message;
  }
  const ax = err as AxiosError<{ detail?: string }>;
  if (ax.response?.data?.detail) return String(ax.response.data.detail);
  const code = ax.code;
  if (code === 'ERR_NETWORK' || ax.message === 'Network Error') {
    return 'Cannot reach the API. In dev, ensure the backend is running and VITE_API_URL in .env matches it, then restart npm run dev. For production builds, set VITE_API_URL and ensure CORS allows this origin.';
  }
  if (code === 'ECONNABORTED') {
    return 'Request timed out. Check that the API is responding and try again.';
  }
  if (ax.message) return ax.message;
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

export function useScenario(
  sid: string | null
): AsyncState<ScenarioInfo> & { refetch: () => Promise<void> } {
  const [data, setData] = useState<ScenarioInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sid) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getScenarioScenariosSidGet({ sid });
      setData(res);
    } catch (e) {
      setError(getErrorMessage(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [sid]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

export function useAssignments(
  sid: string | null
): AsyncState<AssignmentsResult> & { refetch: (opts?: { refresh?: boolean }) => Promise<void> } {
  const [data, setData] = useState<AssignmentsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { refresh?: boolean }) => {
      if (!sid) {
        setData(null);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await getScenarioAssignmentsScenariosSidAssignmentsGet({
          sid,
          refresh: opts?.refresh ?? false,
          agronomistId: undefined,
        });
        setData(res);
      } catch (e) {
        setError(getErrorMessage(e));
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [sid]
  );

  useEffect(() => {
    void load({ refresh: false });
  }, [load]);

  return { data, loading, error, refetch: load };
}

export function useForceAssign(sid: string | null) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (body: ForceAssignRequest) => {
      if (!sid) {
        const msg = 'No scenario selected';
        setError(msg);
        throw new Error(msg);
      }
      setSubmitting(true);
      setError(null);
      try {
        await postForceAssignScenariosSidForceAssignPost({ sid, requestBody: body });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [sid]
  );

  return { mutate, submitting, error };
}

export function useLlmChat() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (messages: ChatMessage[]) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await postChatChatPost({ requestBody: { messages } });
      return res.reply;
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { send, submitting, error, clearError };
}
