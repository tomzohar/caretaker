import { InvitationRepository } from '../entities/invitation/invitation-repository';
import { InvitationRecord } from '../entities/invitation/invitation.entity';
import { UserRecord } from '../entities/user/user.entity';
import {
    DuplicateInvitationError,
    InvitationAlreadyAcceptedError,
    InvitationExpiredError,
    InvitationNotFoundError
} from '../entities/invitation/invitation.errors';
import { StaticClassError } from '../entities/errors';

export class InvitationService {
    constructor() {
        throw new StaticClassError(this.constructor.name);
    }

    public static async createInvitation(
        email: string,
        invitedBy: UserRecord,
        accountId: number
    ): Promise<InvitationRecord> {
        // Check for existing pending invitations
        const existingInvitations = await InvitationRepository.findByEmail(email);
        const hasPendingInvitation = existingInvitations.some(
            inv => inv.status === 'pending' && inv.account.id === accountId
        );

        if (hasPendingInvitation) {
            throw new DuplicateInvitationError(email);
        }

        return InvitationRepository.createInvitation(email, invitedBy, accountId);
    }

    public static async validateInvitation(token: string): Promise<InvitationRecord> {
        const invitation = await InvitationRepository.findByToken(token);
        
        if (!invitation) {
            throw new InvitationNotFoundError();
        }

        if (invitation.status === 'accepted') {
            throw new InvitationAlreadyAcceptedError();
        }

        if (invitation.status === 'expired' || invitation.expiresAt < new Date()) {
            await InvitationRepository.updateStatus(invitation.id, 'expired');
            throw new InvitationExpiredError();
        }

        return invitation;
    }

    public static async acceptInvitation(token: string): Promise<InvitationRecord> {
        const invitation = await this.validateInvitation(token);
        return InvitationRepository.updateStatus(invitation.id, 'accepted');
    }

    public static async getPendingInvitations(accountId: number): Promise<InvitationRecord[]> {
        return InvitationRepository.findPendingInvitations(accountId);
    }
} 