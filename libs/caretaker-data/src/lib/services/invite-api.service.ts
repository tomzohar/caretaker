import { fetchWrapper } from '../fetch/fetch-wrapper';

export interface InviteToAccountRequest {
  emails: string[];
}

export interface InviteToAccountResponse {
  message: string;
}

export class InviteApiService {
  private static readonly BASE_URL = '/api/invite';

  public static async inviteToAccount(
    request: InviteToAccountRequest
  ): Promise<InviteToAccountResponse> {
    return fetchWrapper<InviteToAccountResponse>({
      url: this.BASE_URL,
      method: 'POST',
      body: request,
    });
  }
}
