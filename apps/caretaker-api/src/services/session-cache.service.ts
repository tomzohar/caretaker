import redisClient from '../cache/redis-client';
import Time from './time.service';

const SESSION_CACHE_KEY = 'session-cache';
export const SESSION_CACHE_EXPIRATION_TIME = Time(3).hours(); // 1 hour

const getRedisCacheKey = (userId: number) => {
  return `${SESSION_CACHE_KEY}_${userId}`;
};

export class SessionCacheService {
  public static async getSessionToken(userId: number): Promise<string | null> {
    const sessionCache = await SessionCacheService.getSessionCache(userId);
    return sessionCache || null;
  }

  public static async clearSession(userId: number) {
    await redisClient.del(getRedisCacheKey(userId));
  }

  public static async setSession({
    sessionToken,
    userId,
  }: {
    sessionToken: string;
    userId: number;
  }): Promise<void> {
    await redisClient.setEx(getRedisCacheKey(userId), SESSION_CACHE_EXPIRATION_TIME, sessionToken);
  }

  private static async getSessionCache(userId: number): Promise<string> {
    const redisSession = await redisClient.get(getRedisCacheKey(userId));
    console.log({ userId, redisSession });
    return redisSession;
  }

  public static async sessionExists(userId: number) {
    const sessionToken = await redisClient.get(getRedisCacheKey(userId));
    console.log({ userId, sessionToken });
    return Boolean(sessionToken);
  }
}
