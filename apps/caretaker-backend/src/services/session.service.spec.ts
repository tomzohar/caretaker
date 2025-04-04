import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { QueryFailedError } from 'typeorm';
import { AccountNotFoundError } from '../entities/errors/account-entitiy-errors';
import UserController from '../routes/user/user.controller';
import { UserNotFoundError } from '../routes/user/user.erros';
import { SessionCacheService } from './session-cache.service';
import * as sessionServiceModule from './session.service';
import { SessionTokenPayload } from './session.service';

// Mock SESSION_TOKEN_SECRET
Object.defineProperty(sessionServiceModule, 'SESSION_TOKEN_SECRET', {
  value: 'test-secret',
  writable: true,
  configurable: true,
});

// Define SESSION_CACHE_EXPIRATION_TIME for tests
const TEST_EXPIRATION_TIME = 10800000; // 3 hours in milliseconds

// Set up spies for SessionCacheService
const clearSessionSpy = jest.spyOn(SessionCacheService, 'clearSession');
const getSessionTokenSpy = jest.spyOn(SessionCacheService, 'getSessionToken');
const setSessionSpy = jest.spyOn(SessionCacheService, 'setSession');
const sessionExistsSpy = jest.spyOn(SessionCacheService, 'sessionExists');

// Set up spy for UserController
const getUserByIdSpy = jest.spyOn(UserController, 'getById');

const sessionService = sessionServiceModule.default;

describe('SessionService', () => {
  const mockTokenPayload: SessionTokenPayload = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date().toISOString(),
    iat: Date.now(),
  };

  const mockUser = {
    ...mockTokenPayload,
    account: { id: 1 },
    password: 'hashed-password',
  };

  let validToken: string;

  beforeEach(() => {
    // Create a valid token before each test
    validToken = jwt.sign(JSON.stringify(mockTokenPayload), 'test-secret');
    // Clear all spies
    jest.clearAllMocks();
    // Set up spy implementations
    clearSessionSpy.mockImplementation(() => Promise.resolve());
    getSessionTokenSpy.mockImplementation(() => Promise.resolve(null));
    setSessionSpy.mockImplementation(() => Promise.resolve());
    sessionExistsSpy.mockImplementation(() => Promise.resolve(false));
    getUserByIdSpy.mockImplementation(() => Promise.resolve(mockUser));
  });

  describe('isExpiredSession', () => {
    it('should return true for expired session', () => {
      const expiredToken: SessionTokenPayload = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        iat: Date.now() - TEST_EXPIRATION_TIME - 1000, // 1 second past expiration
      };

      expect(sessionService.isExpiredSession(expiredToken)).toBe(true);
    });

    it('should return false for valid session', () => {
      const validTokenPayload: SessionTokenPayload = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        iat: Date.now() - TEST_EXPIRATION_TIME / 2, // Half of expiration time
      };

      expect(sessionService.isExpiredSession(validTokenPayload)).toBe(false);
    });
  });

  describe('parseSession', () => {
    it('should parse string token data', () => {
      const session = sessionService.parseSession(validToken);
      expect(session).toEqual(mockTokenPayload);
    });

    it('should handle non-string token data', () => {
      const session = sessionService.parseSession(validToken);
      expect(session).toEqual(mockTokenPayload);
    });

    it('should throw error for invalid token', () => {
      expect(() => sessionService.parseSession('invalid.token')).toThrow(
        'jwt malformed'
      );
    });
  });

  describe('isExpiredToken', () => {
    it('should return true for expired token', () => {
      const expiredPayload = {
        ...mockTokenPayload,
        iat: Date.now() - TEST_EXPIRATION_TIME - 1000, // 1 second past expiration
      };
      const expiredToken = jwt.sign(
        JSON.stringify(expiredPayload),
        'test-secret'
      );

      expect(sessionService.isExpiredToken(expiredToken)).toBe(true);
    });

    it('should return false for valid token', () => {
      const validPayload = {
        ...mockTokenPayload,
        iat: Date.now() - TEST_EXPIRATION_TIME / 2, // Half of expiration time
      };
      const validToken = jwt.sign(JSON.stringify(validPayload), 'test-secret');

      expect(sessionService.isExpiredToken(validToken)).toBe(false);
    });

    it('should throw error for invalid token', () => {
      expect(() => sessionService.isExpiredToken('invalid.token')).toThrow(
        'jwt malformed'
      );
    });
  });

  describe('clearSession', () => {
    it('should clear the session from cache', async () => {
      await sessionService.clearSession(1);
      expect(SessionCacheService.clearSession).toHaveBeenCalledWith(1);
    });

    it('should handle Redis errors', async () => {
      const error = new Error('Redis error');
      clearSessionSpy.mockRejectedValueOnce(error);
      await expect(sessionService.clearSession(1)).rejects.toThrow(
        'Redis error'
      );
    });
  });

  describe('isValidToken', () => {
    it('should return true for valid token that exists in cache', async () => {
      sessionExistsSpy.mockResolvedValueOnce(true);
      const result = await sessionService.isValidToken(validToken);
      expect(result).toBe(true);
      expect(sessionExistsSpy).toHaveBeenCalledWith(mockTokenPayload.id);
    });

    it('should return false for valid token that does not exist in cache', async () => {
      sessionExistsSpy.mockResolvedValueOnce(false);
      const result = await sessionService.isValidToken(validToken);
      expect(result).toBe(false);
      expect(sessionExistsSpy).toHaveBeenCalledWith(mockTokenPayload.id);
    });

    it('should throw error for invalid token', async () => {
      await expect(
        sessionService.isValidToken('invalid.token')
      ).rejects.toThrow('jwt malformed');
      expect(sessionExistsSpy).not.toHaveBeenCalled();
    });

    it('should handle Redis errors', async () => {
      sessionExistsSpy.mockRejectedValueOnce(new Error('Redis error'));
      await expect(sessionService.isValidToken(validToken)).rejects.toThrow(
        'Redis error'
      );
      expect(sessionExistsSpy).toHaveBeenCalledWith(mockTokenPayload.id);
    });
  });

  describe('createSession', () => {
    it('should return existing token if valid session exists', async () => {
      getSessionTokenSpy.mockResolvedValueOnce(validToken);
      const result = await sessionService.createSession(1);
      expect(result).toBe(validToken);
      expect(getSessionTokenSpy).toHaveBeenCalledWith(1);
      expect(clearSessionSpy).not.toHaveBeenCalled();
      expect(getUserByIdSpy).not.toHaveBeenCalled();
      expect(setSessionSpy).not.toHaveBeenCalled();
    });

    it('should clear expired session and create new one', async () => {
      const expiredToken = jwt.sign(
        JSON.stringify({
          ...mockTokenPayload,
          iat: Date.now() - TEST_EXPIRATION_TIME - 1000,
        }),
        'test-secret'
      );
      getSessionTokenSpy.mockResolvedValueOnce(expiredToken);

      const result = await sessionService.createSession(1);
      expect(result).not.toBe(expiredToken);
      expect(getSessionTokenSpy).toHaveBeenCalledWith(1);
      expect(clearSessionSpy).toHaveBeenCalledWith(1);
      expect(getUserByIdSpy).toHaveBeenCalledWith(1);
      expect(setSessionSpy).toHaveBeenCalled();
    });

    it('should create new session if no existing session', async () => {
      getSessionTokenSpy.mockResolvedValueOnce(null);

      const result = await sessionService.createSession(1);
      expect(result).toBeTruthy();
      expect(getSessionTokenSpy).toHaveBeenCalledWith(1);
      expect(clearSessionSpy).not.toHaveBeenCalled();
      expect(getUserByIdSpy).toHaveBeenCalledWith(1);
      expect(setSessionSpy).toHaveBeenCalled();
    });

    it('should throw AccountNotFoundError if user has no account', async () => {
      getUserByIdSpy.mockResolvedValueOnce({ ...mockUser, account: null });

      await expect(sessionService.createSession(1)).rejects.toThrow(
        AccountNotFoundError
      );
      expect(getSessionTokenSpy).toHaveBeenCalledWith(1);
      expect(getUserByIdSpy).toHaveBeenCalledWith(1);
      expect(setSessionSpy).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError if user not found', async () => {
      getUserByIdSpy.mockRejectedValueOnce(
        new UserNotFoundError({} as QueryFailedError)
      );

      await expect(sessionService.createSession(1)).rejects.toThrow(
        UserNotFoundError
      );
      expect(getSessionTokenSpy).toHaveBeenCalledWith(1);
      expect(getUserByIdSpy).toHaveBeenCalledWith(1);
      expect(setSessionSpy).not.toHaveBeenCalled();
    });

    it('should handle Redis errors when getting session', async () => {
      getSessionTokenSpy.mockRejectedValueOnce(new Error('Redis error'));

      await expect(sessionService.createSession(1)).rejects.toThrow(
        'Redis error'
      );
      expect(getSessionTokenSpy).toHaveBeenCalledWith(1);
      expect(getUserByIdSpy).not.toHaveBeenCalled();
      expect(setSessionSpy).not.toHaveBeenCalled();
    });

    it('should handle Redis errors when setting session', async () => {
      // Mock successful user lookup
      getUserByIdSpy.mockResolvedValueOnce(mockUser);
      // Mock Redis error when setting session
      setSessionSpy.mockRejectedValueOnce(new Error('Redis error'));

      await expect(sessionService.createSession(1)).rejects.toThrow(
        UserNotFoundError
      );
      expect(getSessionTokenSpy).toHaveBeenCalledWith(1);
      expect(getUserByIdSpy).toHaveBeenCalledWith(1);
      expect(setSessionSpy).toHaveBeenCalled();
    });
  });
});
