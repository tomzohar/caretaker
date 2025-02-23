import { FetchParams } from '../types/fetch-params.interface';
import { BASE_HEADERS } from '../const/base-headers';

function getBaseHeaders(): Record<string, string> {
  const authHeaders: Record<string, string> = {};
  const token = window.sessionStorage.getItem('session_token');

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  return { ...BASE_HEADERS, ...authHeaders };
}

export function fetchWrapper<R>({ url, method, headers, body }: FetchParams): Promise<R> {
  if (!url.includes('/api')) {
    throw new Error('Invalid url, urls must start with /api');
  }
  const apiUrl = url.replace('/api', 'http://localhost:3333');
  return fetch(apiUrl, {
    method,
    headers: {
      ...getBaseHeaders(),
      ...headers
    },
    body: JSON.stringify(body),
  })
    .then(async response => {
    const json = await response.json();
    if ('error' in json || response.status.toString().startsWith('4')) {
      throw new Error(`Http Error \nstatus: ${response.status}\nmessage: ${json.error}`);
    }
    return json;
  }) as Promise<R>;
}
