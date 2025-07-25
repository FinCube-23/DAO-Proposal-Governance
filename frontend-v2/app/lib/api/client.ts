type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(url: string, method: HttpMethod, payload?: unknown): Promise<T> {
  const options: RequestInit = {
    method,
    headers: method === 'GET' ? {} : { 'Content-Type': 'application/json' },
  };

  if (payload && method !== 'GET') {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url, 'GET'),
  post: <T>(url: string, payload: unknown) => request<T>(url, 'POST', payload),
  put: <T>(url: string, payload: unknown) => request<T>(url, 'PUT', payload),
  patch: <T>(url: string, payload: unknown) => request<T>(url, 'PATCH', payload),
  delete: <T>(url: string) => request<T>(url, 'DELETE'),
};
