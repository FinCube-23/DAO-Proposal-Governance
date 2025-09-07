import useAuthStore from '@/shared/stores/auth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  payload?: unknown;
  queryParams?: Record<string, string | number | boolean | undefined | null>;
  customHeaders?: Record<string, string>;
}

function buildQueryString(queryParams?: RequestOptions['queryParams']): string {
  if (!queryParams)
    return '';

  const queryString = Object.entries(queryParams)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');

  return queryString ? `?${queryString}` : '';
}

async function request<T>(
  url: string,
  method: HttpMethod,
  { payload, queryParams, customHeaders }: RequestOptions = {},
): Promise<T> {
  const accessToken = useAuthStore.getState().access;
  // Append query params if provided
  const finalUrl = `${url}${buildQueryString(queryParams)}`;

  const headers: Record<string, string> = {
    ...(method === 'GET' ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(customHeaders || {}),
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (payload && method !== 'GET') {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(finalUrl, options);

  if (!response.ok) {
    // You could expand this with a response.json() for error details
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, options?: Omit<RequestOptions, 'payload'>) =>
    request<T>(url, 'GET', options),
  post: <T>(
    url: string,
    payload?: unknown,
    options?: Omit<RequestOptions, 'payload'>,
  ) => request<T>(url, 'POST', { ...options, payload }),
  put: <T>(
    url: string,
    payload?: unknown,
    options?: Omit<RequestOptions, 'payload'>,
  ) => request<T>(url, 'PUT', { ...options, payload }),
  patch: <T>(
    url: string,
    payload?: unknown,
    options?: Omit<RequestOptions, 'payload'>,
  ) => request<T>(url, 'PATCH', { ...options, payload }),
  delete: <T>(url: string, options?: Omit<RequestOptions, 'payload'>) =>
    request<T>(url, 'DELETE', options),
};
