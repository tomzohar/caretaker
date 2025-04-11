import { AppDataSource } from '../../config/database';
import {
  AccountCreationFailedError,
  AccountNotFoundError,
} from '../../entities/errors/account-entitiy-errors';
import userController from '../user/user.controller';
import {
  UserAlreadyAssignedToAccountError,
  UserNotFoundError,
} from '../user/user.erros';
import { AccountsController } from './accounts.controller';

jest.mock('../../config/database');

jest.mock('../user/user.controller');

jest.spyOn(console, 'error').mockImplementation(() => {
  /* empty implementation */
});

describe('AccountsController', () => {
  const mockFind = jest.fn();
  const mockFindOne = jest.fn();
  const mockCreate = jest.fn();
  const mockSave = jest.fn();

  const mockRepository = {
    find: mockFind,
    findOne: mockFindOne,
    create: mockCreate,
    save: mockSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      return mockRepository;
    });
  });

  it('should find accounts by name', async () => {
    const mockAccount = { id: 1, name: 'Test Account' };
    const mockAccounts = [mockAccount];
    mockFind.mockResolvedValueOnce(mockAccounts);

    const result = await AccountsController.findAccountByName(mockAccount.name);

    expect(mockFind).toHaveBeenCalledWith({
      where: { name: mockAccount.name },
      relations: { users: false },
    });
    expect(result).toEqual(mockAccounts);
  });

  it('should return empty array when account not found by name', async () => {
    mockFind.mockResolvedValueOnce([]);

    const result = await AccountsController.findAccountByName('Nonexistent');

    expect(mockFind).toHaveBeenCalledWith({
      where: { name: 'Nonexistent' },
      relations: { users: false },
    });
    expect(result).toEqual([]);
  });

  it('should handle database errors when finding account by name', async () => {
    const dbError = new Error('Database connection failed');
    mockFind.mockRejectedValueOnce(dbError);

    const result = await AccountsController.findAccountByName('Test Account');

    expect(mockFind).toHaveBeenCalledTimes(1);
    expect(mockFind).toHaveBeenCalledWith({
      where: { name: 'Test Account' },
      relations: { users: false },
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error finding account by name:',
      dbError
    );
    expect(result).toBeNull();
  });

  it('should create a new account and assign user to it', async () => {
    const mockAccountDetails = {
      name: 'Test Account',
      slug: 'test-account',
    };

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      account: null,
    };

    const mockCreatedAccount = {
      id: 1,
      ...mockAccountDetails,
    };

    const mockAccountWithUsers = {
      ...mockCreatedAccount,
      users: [{ ...mockUser, account: mockCreatedAccount }],
    };

    (userController.getById as jest.Mock).mockResolvedValueOnce(mockUser);
    mockCreate.mockReturnValueOnce(mockCreatedAccount);
    mockSave.mockResolvedValueOnce(mockCreatedAccount);
    mockFindOne.mockResolvedValueOnce(mockAccountWithUsers);

    const result = await AccountsController.createAccount(
      mockAccountDetails,
      1
    );

    expect(result).toEqual(mockAccountWithUsers);
  });

  it('should throw AccountCreationFailedError when user not found', async () => {
    const mockAccountDetails = {
      name: 'Test Account',
      slug: 'test-account',
    };

    (userController.getById as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      AccountsController.createAccount(mockAccountDetails, 999)
    ).rejects.toThrow(AccountCreationFailedError);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should throw AccountCreationFailedError when user already has an account', async () => {
    const mockAccountDetails = {
      name: 'Test Account',
      slug: 'test-account',
    };

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      account: { id: 2, name: 'Existing Account' },
    };

    (userController.getById as jest.Mock).mockResolvedValueOnce(mockUser);

    await expect(
      AccountsController.createAccount(mockAccountDetails, 1)
    ).rejects.toThrow(AccountCreationFailedError);

    expect(userController.getById).toHaveBeenCalledWith(1, { account: true });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should return account when found by ID', async () => {
    const mockAccount = { id: 1, name: 'Test Account' };
    mockFindOne.mockResolvedValueOnce(mockAccount);

    const result = await AccountsController.getAccountById(1);

    expect(result).toEqual(mockAccount);
  });

  it('should throw AccountNotFoundError when account not found by ID', async () => {
    mockFindOne.mockResolvedValueOnce(null);

    await expect(AccountsController.getAccountById(999)).rejects.toThrow(
      AccountNotFoundError
    );
    expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 999 } });
  });

  it('should generate slug from account name', async () => {
    mockFindOne.mockResolvedValueOnce(null); // No existing account with this slug

    const result = await AccountsController.generateSlug('Test Account');

    expect(mockFindOne).toHaveBeenCalledWith({
      where: { slug: 'test-account' },
    });
    expect(result).toBe('test-account');
  });

  it('should add numeric suffix when slug already exists', async () => {
    const existingAccount = {
      id: 1,
      name: 'Test Account',
      slug: 'test-account',
    };
    mockFindOne
      .mockResolvedValueOnce(existingAccount) // First call: finds existing account
      .mockResolvedValueOnce(null); // Second call: no account with incremented slug

    const result = await AccountsController.generateSlug('Test Account');

    expect(mockFindOne).toHaveBeenNthCalledWith(1, {
      where: { slug: 'test-account' },
    });
    expect(mockFindOne).toHaveBeenNthCalledWith(2, {
      where: { slug: 'test-account1' },
    });
    expect(result).toBe('test-account1');
  });

  it('should increment numeric suffix until unique slug is found', async () => {
    const existingAccount1 = {
      id: 1,
      name: 'Test Account',
      slug: 'test-account',
    };
    const existingAccount2 = {
      id: 2,
      name: 'Test Account',
      slug: 'test-account1',
    };
    mockFindOne
      .mockResolvedValueOnce(existingAccount1) // First call: finds existing account
      .mockResolvedValueOnce(existingAccount2) // Second call: also finds existing account
      .mockResolvedValueOnce(null); // Third call: no account with incremented slug

    const result = await AccountsController.generateSlug('Test Account');

    expect(mockFindOne).toHaveBeenNthCalledWith(1, {
      where: { slug: 'test-account' },
    });
    expect(mockFindOne).toHaveBeenNthCalledWith(2, {
      where: { slug: 'test-account1' },
    });
    expect(mockFindOne).toHaveBeenNthCalledWith(3, {
      where: { slug: 'test-account2' },
    });
    expect(result).toBe('test-account2');
  });

  it('should throw AccountCreationFailedError when account name is empty', async () => {
    await expect(AccountsController.generateSlug('')).rejects.toThrow(
      AccountCreationFailedError
    );
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('should join a user to an existing account', async () => {
    const mockAccount = {
      id: 1,
      name: 'Test Account',
      slug: 'test-account',
      users: [],
    };

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      account: null,
    };

    mockFindOne
      .mockResolvedValueOnce(mockAccount) // First call: find account by ID
      .mockResolvedValueOnce({ ...mockAccount, users: [mockUser] }); // Second call: reload account after update

    (userController.getById as jest.Mock).mockResolvedValueOnce(mockUser);
    (userController.updateUser as jest.Mock).mockResolvedValueOnce({
      ...mockUser,
      account: mockAccount,
    });

    const result = await AccountsController.joinAccount(1, 1);

    expect(mockFindOne).toHaveBeenCalledTimes(2);
    expect(mockFindOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      relations: { users: true },
    });
    expect(userController.getById).toHaveBeenCalledWith(1, { account: true });
    expect(userController.updateUser).toHaveBeenCalledWith(1, {
      account: mockAccount,
    });
    expect(result).toEqual({ ...mockAccount, users: [mockUser] });
  });

  it('should throw AccountNotFoundError when account does not exist', async () => {
    mockFindOne.mockResolvedValueOnce(null);

    await expect(AccountsController.joinAccount(999, 1)).rejects.toThrow(
      AccountNotFoundError
    );

    expect(mockFindOne).toHaveBeenCalledWith({
      where: { id: 999 },
      relations: { users: true },
    });
    expect(userController.getById).not.toHaveBeenCalled();
  });

  it('should throw UserNotFoundError when user does not exist', async () => {
    const mockAccount = {
      id: 1,
      name: 'Test Account',
      slug: 'test-account',
      users: [],
    };

    mockFindOne.mockResolvedValueOnce(mockAccount);
    (userController.getById as jest.Mock).mockResolvedValueOnce(null);

    await expect(AccountsController.joinAccount(1, 999)).rejects.toThrow(
      UserNotFoundError
    );

    expect(mockFindOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { users: true },
    });
    expect(userController.getById).toHaveBeenCalledWith(999, { account: true });
    expect(userController.updateUser).not.toHaveBeenCalled();
  });

  it('should throw UserAlreadyAssignedToAccountError when user already has an account', async () => {
    const mockAccount = {
      id: 1,
      name: 'Test Account',
      slug: 'test-account',
      users: [],
    };

    mockFindOne.mockResolvedValueOnce(mockAccount);
    (userController.getById as jest.Mock).mockResolvedValueOnce({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      account: { id: 2, name: 'Another Account' },
    });

    await expect(AccountsController.joinAccount(1, 1)).rejects.toThrow(
      UserAlreadyAssignedToAccountError
    );

    expect(mockFindOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { users: true },
    });
    expect(userController.getById).toHaveBeenCalledWith(1, { account: true });
    expect(userController.updateUser).not.toHaveBeenCalled();
  });
});
