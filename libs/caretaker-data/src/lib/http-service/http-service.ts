import { fetchWrapper } from '../fetch/fetch-wrapper';

export class HttpService {

  public static get<R>(url: string): Promise<R> {
    return fetchWrapper<R>({
      url,
      method: 'GET',
    });
  }

  public static post<R>(url: string, body: any): Promise<R> {
    return fetchWrapper({
      url, method: 'POST', body
    });
  }

  public static put<R>(url: string, body: any): Promise<R> {
    return fetchWrapper({
      url, method: 'PUT', body
    });
  }

  public static patch<R>(url: string, body: any): Promise<R> {
    return fetchWrapper({
      url, method: 'PATCH', body
    });
  }

  public static delete<R>(url: string): Promise<R> {
    return fetchWrapper({
      url, method: 'DELETE',
    });
  }
}
