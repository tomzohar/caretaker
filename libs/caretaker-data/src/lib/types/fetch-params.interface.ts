type FetchBody = BodyInit | null | undefined | object;

export interface FetchParams {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' |'DELETE';
  headers?: Record<string, string>;
  body?: FetchBody;
}
