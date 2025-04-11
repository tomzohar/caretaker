import { AppDataSource } from '../../config/database';
import {
  AccountCreationFailedError,
  AccountNotFoundError,
} from '../../entities/errors/account-entitiy-errors';
// Import entity types for mock setup
import AccountRecord from '../../entities/account/account.entity';
import userController from '../user/user.controller';
import {
  UserAlreadyAssignedToAccountError,
  UserNotFoundError,
} from '../user/user.erros';
import { AccountsController } from './accounts.controller';

// Mock the database module's getRepository to return our mocks
jest.mock('../../config/database');

// Mock the user controller
jest.mock('../user/user.controller');

// Mock console.error to avoid noisy output
jest.spyOn(console, 'error').mockImplementation(() => {
  /* empty implementation */
});

describe('AccountsController', () => {
  // Define our mocks inside the describe block
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

    // Set up AppDataSource.getRepository to return our mock repository
    // This works because we mocked the entire module above
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === AccountRecord) {
        return mockRepository;
      }
      return mockRepository; // Return the mock anyway for test stability
    });
  });

  // Test findAccountByName
  it('should find accounts by name', async () => {
    // Arrange
    const mockAccounts = [{ id: 1, name: 'Test Account' }];
    mockFind.mockResolvedValueOnce(mockAccounts);

    // Act
    const result = await AccountsController.findAccountByName('Test Account');

    // Assert
    expect(mockFind).toHaveBeenCalledTimes(1);
    expect(mockFind).toHaveBeenCalledWith({
      where: { name: 'Test Account' },
      relations: { users: false },
    });
    expect(result).toEqual(mockAccounts);
  });

  // Test findAccountByName with empty result
  it('should return empty array when account not found by name', async () => {
    // Arrange
    mockFind.mockResolvedValueOnce([]);

    // Act
    const result = await AccountsController.findAccountByName('Nonexistent');

    // Assert
    expect(mockFind).toHaveBeenCalledTimes(1);
    expect(mockFind).toHaveBeenCalledWith({
      where: { name: 'Nonexistent' },
      relations: { users: false },
    });
    expect(result).toEqual([]);
  });

  // Test findAccountByName handling errors
  it('should handle database errors when finding account by name', async () => {
    // Arrange
    const dbError = new Error('Database connection failed');
    mockFind.mockRejectedValueOnce(dbError);

    // Act
    const result = await AccountsController.findAccountByName('Test Account');

    // Assert
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

  // Test createAccount
  it('should create a new account and assign user to it', async () => {
    // Arrange
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

    // Act
    const result = await AccountsController.createAccount(
      mockAccountDetails,
      1
    );

    // Assert
    expect(userController.getById).toHaveBeenCalledWith(1, { account: true });
    expect(mockCreate).toHaveBeenCalledWith(mockAccountDetails);
    expect(mockSave).toHaveBeenCalledWith(mockCreatedAccount);
    expect(userController.updateUser).toHaveBeenCalledWith(1, {
      account: mockCreatedAccount,
    });
    expect(mockFindOne).toHaveBeenCalledWith({
      where: { id: mockCreatedAccount.id },
      relations: { users: true },
    });
    expect(result).toEqual(mockAccountWithUsers);
  });

  // Test createAccount when user not found
  it('should throw AccountCreationFailedError when user not found', async () => {
    // Arrange
    const mockAccountDetails = {
      name: 'Test Account',
      slug: 'test-account',
    };

    (userController.getById as jest.Mock).mockResolvedValueOnce(null);

    // Act & Assert
    await expect(
      AccountsController.createAccount(mockAccountDetails, 999)
    ).rejects.toThrow(AccountCreationFailedError);

    // Verify the mocks were called appropriately
    expect(userController.getById).toHaveBeenCalledWith(999, { account: true });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // Test createAccount when user already has an account
  it('should throw AccountCreationFailedError when user already has an account', async () => {
    // Arrange
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

    // Act & Assert
    await expect(
      AccountsController.createAccount(mockAccountDetails, 1)
    ).rejects.toThrow(AccountCreationFailedError);

    // Verify the mocks were called appropriately
    expect(userController.getById).toHaveBeenCalledWith(1, { account: true });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // Test getAccountById
  it('should return account when found by ID', async () => {
    // Arrange
    const mockAccount = { id: 1, name: 'Test Account' };
    mockFindOne.mockResolvedValueOnce(mockAccount);

    // Act
    const result = await AccountsController.getAccountById(1);

    // Assert
    expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(mockAccount);
  });

  // Test getAccountById when account not found
  it('should throw AccountNotFoundError when account not found by ID', async () => {
    // Arrange
    mockFindOne.mockResolvedValueOnce(null);

    // Act & Assert
    await expect(AccountsController.getAccountById(999)).rejects.toThrow(
      AccountNotFoundError
    );
    expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 999 } });
  });

  // Test generateSlug
  it('should generate slug from account name', async () => {
    // Arrange
    mockFindOne.mockResolvedValueOnce(null); // No existing account with this slug

    // Act
    const result = await AccountsController.generateSlug('Test Account');

    // Assert
    expect(mockFindOne).toHaveBeenCalledWith({
      where: { slug: 'test-account' },
    });
    expect(result).toBe('test-account');
  });

  // Test generateSlug with existing slug
  it('should add numeric suffix when slug already exists', async () => {
    // Arrange
    const existingAccount = {
      id: 1,
      name: 'Test Account',
      slug: 'test-account',
    };
    mockFindOne
      .mockResolvedValueOnce(existingAccount) // First call: finds existing account
      .mockResolvedValueOnce(null); // Second call: no account with incremented slug

    // Act
    const result = await AccountsController.generateSlug('Test Account');

    // Assert
    expect(mockFindOne).toHaveBeenNthCalledWith(1, {
      where: { slug: 'test-account' },
    });
    expect(mockFindOne).toHaveBeenNthCalledWith(2, {
      where: { slug: 'test-account1' },
    });
    expect(result).toBe('test-account1');
  });

  // Test generateSlug with multiple existing slugs
  it('should increment numeric suffix until unique slug is found', async () => {
    // Arrange
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

    // Act
    const result = await AccountsController.generateSlug('Test Account');

    // Assert
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

  // Test generateSlug with empty account name
  it('should throw AccountCreationFailedError when account name is empty', async () => {
    // Act & Assert
    await expect(AccountsController.generateSlug('')).rejects.toThrow(
      AccountCreationFailedError
    );
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  // Test joinAccount
  it('should join a user to an existing account', async () => {
    // Arrange
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

    // Act
    const result = await AccountsController.joinAccount(1, 1);

    // Assert
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

  // Test joinAccount when account not found
  it('should throw AccountNotFoundError when account does not exist', async () => {
    // Arrange
    mockFindOne.mockResolvedValueOnce(null);

    // Act & Assert
    await expect(AccountsController.joinAccount(999, 1)).rejects.toThrow(
      AccountNotFoundError
    );

    expect(mockFindOne).toHaveBeenCalledWith({
      where: { id: 999 },
      relations: { users: true },
    });
    expect(userController.getById).not.toHaveBeenCalled();
  });

  // Test joinAccount when user not found
  it('should throw UserNotFoundError when user does not exist', async () => {
    // Arrange
    const mockAccount = {
      id: 1,
      name: 'Test Account',
      slug: 'test-account',
      users: [],
    };

    mockFindOne.mockResolvedValueOnce(mockAccount);
    (userController.getById as jest.Mock).mockResolvedValueOnce(null);

    // Act & Assert
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

  // Test joinAccount when user already has an account
  it('should throw UserAlreadyAssignedToAccountError when user already has an account', async () => {
    // Arrange
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

    // Act & Assert
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
