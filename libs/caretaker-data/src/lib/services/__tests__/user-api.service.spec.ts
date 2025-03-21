import { HttpService } from '../../http-service/http-service';
import { UserApiService } from '../user-api.service';
import { User } from '@caretaker/caretaker-types';

// Mock the HttpService
jest.mock('../../http-service/http-service');

describe('UserApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should call HttpService.get with correct endpoint and return user data', async () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        account: {
          id: 1,
          name: 'Test Account',
          slug: 'test-account',
          users: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockResponse = {
        user: mockUser,
        expired: false,
        error: '',
      };

      (HttpService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await UserApiService.getCurrentUser();

      expect(HttpService.get).toHaveBeenCalledWith('/api/users/me');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when session is expired', async () => {
      const mockResponse = {
        user: null,
        expired: true,
        error: 'Session expired',
      };

      (HttpService.get as jest.Mock).mockResolvedValue(mockResponse);

      await expect(UserApiService.getCurrentUser()).rejects.toThrow('Session expired');
    });
  });
}); 