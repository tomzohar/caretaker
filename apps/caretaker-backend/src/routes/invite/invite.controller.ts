import { AppDataSource } from '../../config/database';
import { AccountNotFoundError } from '../../entities/errors/account-entitiy-errors';
import { UserRecord } from '../../entities/user/user.entity';
import { InvitationService } from '../../services';
import { UserNotFoundError } from '../user/user.erros';

export class InviteController {
  public static async createInvitations(
    emails: string[],
    invitedBy: UserRecord['id']
  ): Promise<void> {
    try {
      const user = await AppDataSource.manager.findOne(UserRecord, {
        where: { id: invitedBy },
        relations: {
          account: true,
        },
      });

      InviteController.validateInviterUser(user);
      const invitations = await Promise.all(emails.map((email) => {
        return InvitationService.createInvitation(email, user, user.account.id);
      }));

      await Promise.all(invitations);

      console.log(`${emails.join(', ')} invited by ${user.name} to account ${user.account.name}`);
    } catch (error) {
      console.error('Failed to create invitations:', error);
      if (error instanceof AccountNotFoundError) {
        throw error;
      }

      if (error instanceof UserNotFoundError) {
        throw error;
      }


    // TODO: Implement invitation creation
    // This will:
    // DONE - 1. Create invitation records in the database
    // 2. Send invitation emails to the provided addresses
    // 3. Handle duplicate invitations and validation

      throw new Error('Failed to create invitations');
    }
  }

  private static validateInviterUser(user: UserRecord): void {
    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.account) {
      throw new AccountNotFoundError();
    }
  }
}
