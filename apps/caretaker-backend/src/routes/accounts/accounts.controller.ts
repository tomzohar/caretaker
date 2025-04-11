import { AppDataSource } from '../../config/database';
import AccountRecord from '../../entities/account/account.entity';
import {
  AccountCreationFailedError,
  AccountNotFoundError,
} from '../../entities/errors/account-entitiy-errors';
import BaseError from '../../entities/errors/base-error.class';
import { UserRecord } from '../../entities/user/user.entity';
import { isEmptyString } from '../../utils/string.utils';
import userController from '../user/user.controller';
import {
  UserAlreadyAssignedToAccountError,
  UserNotFoundError,
} from '../user/user.erros';

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
      const user = await userController.getById(userId, { account: true });
      if (!user) {
        throw new UserNotFoundError();
      }

      if (user.account) {
        throw new UserAlreadyAssignedToAccountError();
      }

      const account = accounts.create(accountDetails);
      await accounts.save(account);

      // Update the user to point to this account (this is the owning side of the relationship)
      user.account = account;
      await userController.updateUser(user.id, { account });

      // Now fetch the account with its relationships
      return accounts.findOne({
        where: { id: account.id },
        relations: { users: true },
      });
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
    if (isEmptyString(accountName)) {
      throw new AccountCreationFailedError(new Error('Account name required'));
    }
    const slug = accountName.toLowerCase().split(' ').join('-') + suffix;
    const accounts = getAccountRepo();
    const account = await accounts.findOne({ where: { slug } });
    if (account) {
      return AccountsController.generateSlug(
        accountName,
        String(Number(suffix || 0) + 1)
      );
    }
    return slug;
  }

  public static async findAccountByName(
    name: string
  ): Promise<AccountRecord[] | null> {
    try {
      const accounts = getAccountRepo();
      const foundAccounts = await accounts.find({
        where: { name },
        relations: { users: false },
      });
      return foundAccounts;
    } catch (err) {
      console.error('Error finding account by name:', err);
      return null;
    }
  }

  public static async joinAccount(
    accountId: number,
    userId: UserRecord['id']
  ): Promise<AccountRecord> {
    try {
      const accounts = getAccountRepo();
      const account = await accounts.findOne({
        where: { id: accountId },
        relations: { users: true },
      });

      if (!account) {
        throw new AccountNotFoundError();
      }

      const user = await userController.getById(userId, { account: true });
      if (!user) {
        throw new UserNotFoundError();
      }

      if (user.account) {
        throw new UserAlreadyAssignedToAccountError();
      }

      // Update the user to point to this account
      user.account = account;
      await userController.updateUser(user.id, { account });

      // Reload the account with updated users
      return accounts.findOne({
        where: { id: account.id },
        relations: { users: true },
      });
    } catch (err) {
      throw err instanceof BaseError
        ? err
        : new AccountCreationFailedError(err);
    }
  }
}
