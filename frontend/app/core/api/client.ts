import useAuthStore from '@/shared/stores/auth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface TokenErrorResponse {
  detail: string;
  code: string;
  messages: Array<{
    token_class: string;
    token_type: string;
    message: string;
  }>;
}

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
    // Handle 401 token expiration
    if (response.status === 401) {
      try {
        const errorData: TokenErrorResponse = await response.json();

        // Check if it's a token expiration error
        if (
          errorData.code === 'token_not_valid'
          && errorData.detail === 'Given token not valid for any token type'
        ) {
          // Clear auth state
          useAuthStore.getState().clearAuthState();

          // Redirect to login page
          window.location.href = '/error/401';

          // Throw a specific error
          throw new Error('Session expired. Please login again.');
        }
      }
      catch (jsonError) {
        // If JSON parsing fails, fall through to generic error
        console.error('Failed to parse 401 error response:', jsonError);
      }
    }

    // For other errors, you could expand this with response.json() for error details
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
