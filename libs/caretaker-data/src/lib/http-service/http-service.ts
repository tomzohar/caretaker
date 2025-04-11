import { fetchWrapper } from '../fetch/fetch-wrapper';
import { FetchParams } from '../types/fetch-params.interface';

type FetchBody = FetchParams['body'];

export class HttpService {

  public static get<R>(url: string): Promise<R> {
    return fetchWrapper<R>({
      url,
      method: 'GET',
    });
  }

  public static post<R, T extends FetchBody = object>(url: string, body: T): Promise<R> {
    return fetchWrapper({
      url, method: 'POST', body
    });
  }

  public static put<R, T extends NonNullable<FetchBody>>(url: string, body: T): Promise<R> {
    return fetchWrapper({
      url, method: 'PUT', body
    });
  }

  public static patch<R, T extends NonNullable<FetchBody>>(url: string, body: T): Promise<R> {
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
