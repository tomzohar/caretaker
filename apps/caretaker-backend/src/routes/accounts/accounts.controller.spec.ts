import { AppDataSource } from '../../config/database';
import {
  AccountCreationFailedError,
  AccountNotFoundError,
} from '../../entities/errors/account-entitiy-errors';
import userController from '../user/user.controller';
import { AccountsController } from './accounts.controller';

// Mock the database module
jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

// Mock the user controller module
jest.mock('../user/user.controller', () => ({
  __esModule: true,
  default: {
    getById: jest.fn(),
    updateUser: jest.fn(),
  },
}));

// Mock console.error to avoid noisy output
jest.spyOn(console, 'error').mockImplementation(() => {
  /* empty implementation */
});

describe('AccountsController', () => {
  // Setup mock repository
  const mockFindOne = jest.fn();
  const mockCreate = jest.fn();
  const mockSave = jest.fn();
  const mockRepository = {
    create: mockCreate,
    save: mockSave,
    findOne: mockFindOne,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up AppDataSource.getRepository to return our mock repository
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  describe('createAccount', () => {
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

    it('should create a new account and assign user to it', async () => {
      // Arrange
      (userController.getById as jest.Mock).mockResolvedValueOnce(mockUser);
      mockCreate.mockReturnValueOnce(mockCreatedAccount);
      mockSave.mockResolvedValueOnce(mockCreatedAccount);

      const mockAccountWithUsers = {
        ...mockCreatedAccount,
        users: [{ ...mockUser, account: mockCreatedAccount }],
      };

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

    it('should throw AccountCreationFailedError when user not found', async () => {
      // Arrange
      (userController.getById as jest.Mock).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        AccountsController.createAccount(mockAccountDetails, 999)
      ).rejects.toThrow(AccountCreationFailedError);
    });

    it('should throw AccountCreationFailedError when user already has an account', async () => {
      // Arrange
      const userWithAccount = {
        ...mockUser,
        account: { id: 2, name: 'Existing Account' },
      };

      (userController.getById as jest.Mock).mockResolvedValueOnce(
        userWithAccount
      );

      // Act & Assert
      await expect(
        AccountsController.createAccount(mockAccountDetails, 1)
      ).rejects.toThrow(AccountCreationFailedError);
    });
  });

  describe('findAccountByName', () => {
    it('should return account when found', async () => {
      // Arrange
      const mockAccount = { id: 1, name: 'Test Account' };
      mockFindOne.mockResolvedValueOnce(mockAccount);

      // Act
      const result = await AccountsController.findAccountByName('Test Account');

      // Assert
      expect(mockFindOne).toHaveBeenCalled();
      expect(result).toEqual(mockAccount);
    });

    it('should return null when account not found', async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce(null);

      // Act
      const result = await AccountsController.findAccountByName('Nonexistent');

      // Assert
      expect(mockFindOne).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle database errors and return null', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockFindOne.mockRejectedValueOnce(dbError);

      // Act
      const result = await AccountsController.findAccountByName('Test Account');

      // Assert
      expect(mockFindOne).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Error finding account by name:',
        dbError
      );
      expect(result).toBeNull();
    });
  });

  describe('getAccountById', () => {
    it('should return account when found', async () => {
      // Arrange
      const mockAccount = { id: 1, name: 'Test Account' };
      mockFindOne.mockResolvedValueOnce(mockAccount);

      // Act
      const result = await AccountsController.getAccountById(1);

      // Assert
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockAccount);
    });

    it('should throw AccountNotFoundError when account not found', async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(AccountsController.getAccountById(999)).rejects.toThrow(
        AccountNotFoundError
      );
    });
  });

  describe('generateSlug', () => {
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
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { slug: 'test-account' },
      });
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { slug: 'test-account1' },
      });
      expect(result).toBe('test-account1');
    });

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
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { slug: 'test-account' },
      });
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { slug: 'test-account1' },
      });
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { slug: 'test-account2' },
      });
      expect(result).toBe('test-account2');
    });

    it('should throw AccountCreationFailedError when account name is empty', async () => {
      // Act & Assert
      await expect(AccountsController.generateSlug('')).rejects.toThrow(
        AccountCreationFailedError
      );
    });
  });

  describe('joinAccount', () => {
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

    it('should join a user to an existing account', async () => {
      // Arrange
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
      expect(userController.getById).toHaveBeenCalledWith(1, { account: true });
      expect(userController.updateUser).toHaveBeenCalledWith(1, {
        account: mockAccount,
      });
      expect(result).toEqual({ ...mockAccount, users: [mockUser] });
    });

    it('should throw AccountNotFoundError when account does not exist', async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(AccountsController.joinAccount(999, 1)).rejects.toThrow(
        AccountNotFoundError
      );
    });

    it('should throw error containing UserNotFoundError message when user does not exist', async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce(mockAccount);
      (userController.getById as jest.Mock).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(AccountsController.joinAccount(1, 999)).rejects.toThrow(
        /User not found/
      );
    });

    it('should throw error containing UserAlreadyAssignedToAccountError message when user already has an account', async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce(mockAccount);
      (userController.getById as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        account: { id: 2, name: 'Another Account' },
      });

      // Act & Assert
      await expect(AccountsController.joinAccount(1, 1)).rejects.toThrow(
        /User is already assigned to account/
      );
    });
  });
});
