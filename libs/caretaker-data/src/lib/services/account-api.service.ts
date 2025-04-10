import { Account } from '@caretaker/caretaker-types';
import { HttpService } from '../http-service/http-service';

interface AccountSearchResponse {
  account: {
    id: number;
    name: string;
    slug: string;
    usersCount: number;
  } | null;
}

export class AccountApiService {
  public static async createAccount(accountDetails: Partial<Account>): Promise<Account> {
    const { account } = await HttpService.post<{ account: Account }>(
      '/api/accounts',
      accountDetails
    );
    return account;
  }

  public static async checkAccountExists(name: string): Promise<AccountSearchResponse> {
    return await HttpService.get<AccountSearchResponse>(
      `/api/accounts/search?name=${encodeURIComponent(name)}`
    );
  }

  public static async joinAccount(accountId: number): Promise<Account> {
    const { account } = await HttpService.post<{ account: Account }>(
      `/api/accounts/join/${accountId}`, {});
    return account;
  }
}
