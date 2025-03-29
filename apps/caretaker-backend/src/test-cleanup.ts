import { afterAll } from '@jest/globals';
import redisClient from './cache/redis-client';
import { InvitationCleanupService } from './services';

export async function cleanup(): Promise<void> {
  // Stop the invitation cleanup service
  InvitationCleanupService.stopCleanupSchedule();

  // Disconnect Redis client
  await redisClient.disconnect();
}

afterAll(async () => {
  await cleanup();
});
