import { Account } from '@caretaker/caretaker-types';
import { HttpService } from '../http-service/http-service';

export class AccountApiService {
  public static async createAccount(accountDetails: Partial<Account>): Promise<Account> {
    const { account } = await HttpService.post<{ account: Account }>(
      '/api/accounts',
      accountDetails
    );
    return account;
  }
}
