import cron from 'node-cron';
import { LessThan } from 'typeorm';
import { AppDataSource } from '../config/database';
import { InvitationRecord } from '../entities/invitation/invitation.entity';
import Time from './time.service';
import { StaticClassError } from '../entities/errors';

export class InvitationCleanupService {
  private static readonly CLEANUP_SCHEDULE = '0 3 * * *'; // Run at 3 AM every day
  private static readonly RETENTION_PERIOD = Time(7).days(); // Keep expired invitations for 7 days
  private static cronJob: cron.ScheduledTask;

  private constructor() {
    throw new StaticClassError(this.constructor.name);
  }

  public static startCleanupSchedule(): void {
    if (this.cronJob) {
      console.log('Cleanup schedule already running');
      return;
    }

    this.cronJob = cron.schedule(this.CLEANUP_SCHEDULE, async () => {
      try {
        await this.cleanupExpiredInvitations();
      } catch (error) {
        console.error('Failed to cleanup expired invitations:', error);
      }
    });

    console.log('Invitation cleanup schedule started');
  }

  public static stopCleanupSchedule(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('Invitation cleanup schedule stopped');
    }
  }

  private static async cleanupExpiredInvitations(): Promise<void> {
    const repo = AppDataSource.getRepository(InvitationRecord);
    const retentionDate = new Date(Date.now() - this.RETENTION_PERIOD);

    try {
      // First, mark recently expired invitations as 'expired'
      const updated = await repo.update(
        {
          status: 'pending',
          expiresAt: LessThan(new Date()),
        },
        { status: 'expired' }
      );

      // Then, soft delete old expired invitations
      const deleted = await repo.update(
        {
          status: 'expired',
          updatedAt: LessThan(retentionDate),
          deletedAt: null,
        },
        { deletedAt: new Date() }
      );

      console.log(
        `Invitation cleanup completed: ${updated.affected} marked as expired, ${deleted.affected} soft deleted`
      );
    } catch (error) {
      console.error('Error during invitation cleanup:', error);
      throw error;
    }
  }

  // For manual cleanup or testing
  public static async runCleanupNow(): Promise<void> {
    await this.cleanupExpiredInvitations();
  }
}
