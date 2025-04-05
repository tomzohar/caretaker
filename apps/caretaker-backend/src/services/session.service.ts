import UserController from '../routes/user/user.controller';
import jwt from 'jsonwebtoken';
import { UserRecord } from '../entities/user/user.entity';
import { isNonEmptyString } from '../utils/string.utils';
import { SESSION_CACHE_EXPIRATION_TIME, SessionCacheService } from './session-cache.service';
import { UserNotFoundError } from '../routes/user/user.erros';
import { QueryFailedError } from 'typeorm';

export class PendingAccountError extends Error {
  constructor(userId: number) {
    super(`User ${userId} needs to be associated with an account before logging in`);
    this.name = 'PendingAccountError';
  }
}

export type SessionTokenPayload = Pick<
  UserRecord,
  'id' | 'email' | 'name' | 'createdAt'
> & {
  iat: number;
};

export const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET || '';

class SessionService {
  private static _instances = 0;

  constructor() {
    SessionService._instances++;
    if (SessionService._instances > 1) {
      throw new Error(
        `Cannot create another instance of singleton class ${this.constructor.name}}`
      );
    }
  }

  async createSession(userId: number, isPending = false): Promise<string> {
    const existingSessionToken = await SessionCacheService.getSessionToken(userId);
    if (existingSessionToken) {
      if (!this.isExpiredToken(existingSessionToken)) {
        // TODO: Create a new session with new expiration time and return the new token
        return existingSessionToken;
      }
      await this.clearSession(userId);
    }

    try {
      const user = await UserController.getById(userId);
      
      // Check if user has an account
      if (!isPending && !user.account) {
        throw new PendingAccountError(userId);
      }

      const tokenPayload = {
        ...user,
        iat: Date.now(),
      } as SessionTokenPayload;
      const sessionToken = jwt.sign(
        JSON.stringify(tokenPayload),
        SESSION_TOKEN_SECRET
      );
      await SessionCacheService.setSession({ sessionToken, userId });
      return sessionToken;
    } catch (err) {
      console.log(err);
      if (err instanceof PendingAccountError) {
        throw err;
      }
      throw new UserNotFoundError(err as QueryFailedError);
    }
  }

  isExpiredToken(token: string): boolean {
    const tokenData: SessionTokenPayload = this.parseSession(token);
    return this.isExpiredSession(tokenData);
  }

  isExpiredSession(tokenData: SessionTokenPayload): boolean {
    return Date.now() - tokenData.iat >= SESSION_CACHE_EXPIRATION_TIME;
  }

  parseSession(token: string): SessionTokenPayload {
    const tokenData = jwt.verify(token, SESSION_TOKEN_SECRET);
    return <SessionTokenPayload>(
      (isNonEmptyString(tokenData)
        ? JSON.parse(tokenData as string)
        : tokenData)
    );
  }

  async clearSession(userId: number): Promise<void> {
    await SessionCacheService.clearSession(userId);
  }

  async isValidToken(token: string): Promise<boolean> {
    const sessionData = this.parseSession(token);
    return Boolean(sessionData) && await SessionCacheService.sessionExists(sessionData.id);
  }
}

const sessionService = new SessionService();
export default sessionService;
