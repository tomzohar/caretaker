import AccountRecord from '../../entities/account/account.entity';
import { UserRecord } from '../../entities/user/user.entity';
import { AppDataSource } from '../../config/database';
import userController from '../user/user.controller';
import { UserAlreadyAssignedToAccountError, UserNotFoundError } from '../user/user.erros';
import { AccountCreationFailedError, AccountNotFoundError } from '../../entities/errors/account-entitiy-errors';
import { isEmptyString } from '../../utils/string.utils';

function getAccountRepo() {
  return AppDataSource.getRepository(AccountRecord);
}

export class AccountsController {
  public static async createAccount(
    accountDetails: Partial<AccountRecord>,
    userId: UserRecord['id']
  ) {
    try {
      const accounts = getAccountRepo();
      const user = await userController.getById(userId, {account: true});
      if (!user) {
        throw new UserNotFoundError();
      }

      if (user.account) {
        throw new UserAlreadyAssignedToAccountError();
      }

      const account = accounts.create(accountDetails);
      await accounts.save(account);
      await userController.updateUser(user.id, { account });
      return accounts.findBy({ id: account.id });
    } catch (err) {
      throw new AccountCreationFailedError(err);
    }
  }

  public static async getAccountById(
    accountId: number
  ): Promise<AccountRecord> {
    const accounts = getAccountRepo();
    const account = await accounts.findOne({ where: { id: accountId } });
    if (!account) {
      throw new AccountNotFoundError();
    }
    return account;
  }

  public static async generateSlug(accountName: string, suffix = '') {
    if (isEmptyString(accountName )) {
      throw new AccountCreationFailedError(new Error('Account name required'));
    }
    const slug = accountName.toLowerCase().split(' ').join('-') + suffix;
    const accounts = getAccountRepo();
    const account = await accounts.findOne({ where: { slug } });
    if (account) {
      return AccountsController.generateSlug(accountName, String(Number(suffix || 0) + 1));
    }
    return slug;
  }
}
