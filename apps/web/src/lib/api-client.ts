const BASE_URL = import.meta.env['VITE_API_BASE_URL'] ?? '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type RequestOptions = {
  /**
   * Send an `Idempotency-Key` header. The BE (real or MSW-mocked) is expected
   * to short-circuit duplicate requests with the same key within a window,
   * returning the original response. Safe to set on retryable mutations.
   */
  idempotencyKey?: string;
};

async function request<T>(path: string, init?: RequestInit, opts?: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (opts?.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(res.statusText, res.status, body);
  }

  return body as T;
}

function withBody(method: string, body?: unknown): RequestInit {
  return body === undefined
    ? { method }
    : { method, body: JSON.stringify(body) };
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, withBody('POST', body), opts),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, withBody('PUT', body), opts),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, withBody('PATCH', body), opts),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export { ApiError };
