import { AppDataSource } from '../../config/database';
import { Repository, MoreThan } from 'typeorm';
import { InvitationRecord } from './invitation.entity';
import { StaticClassError } from '../errors';
import { UserRecord } from '../user/user.entity';
import * as crypto from 'crypto';

const getInvitationSelectOptions = () => ({
    id: true,
    email: true,
    status: true,
    token: true,
    expiresAt: true,
    createdAt: true,
    updatedAt: true,
    invitedBy: {
        id: true,
        name: true,
        email: true
    },
    account: {
        id: true,
        name: true,
        slug: true
    }
});

export class InvitationRepository {
    constructor() {
        throw new StaticClassError(this.constructor.name);
    }

    private static getRepository(): Repository<InvitationRecord> {
        return AppDataSource.getRepository(InvitationRecord);
    }

    public static async createInvitation(
        email: string,
        invitedBy: UserRecord,
        accountId: number,
        expirationHours = 48
    ): Promise<InvitationRecord> {
        const repo = InvitationRepository.getRepository();
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expirationHours);

        const invitation = repo.create({
            email,
            invitedBy,
            account: { id: accountId },
            token,
            expiresAt,
            status: 'pending'
        });

        return repo.save(invitation);
    }

    public static async findByToken(token: string): Promise<InvitationRecord | null> {
        const repo = InvitationRepository.getRepository();
        return repo.findOne({
            where: { token },
            select: getInvitationSelectOptions(),
            relations: {
                invitedBy: true,
                account: true
            }
        });
    }

    public static async findByEmail(email: string): Promise<InvitationRecord[]> {
        const repo = InvitationRepository.getRepository();
        return repo.find({
            where: { email },
            select: getInvitationSelectOptions(),
            relations: {
                invitedBy: true,
                account: true
            }
        });
    }

    public static async updateStatus(
        id: number,
        status: InvitationRecord['status']
    ): Promise<InvitationRecord> {
        const repo = InvitationRepository.getRepository();
        await repo.update(id, { status });
        return repo.findOneBy({ id }) as Promise<InvitationRecord>;
    }

    public static async findPendingInvitations(accountId: number): Promise<InvitationRecord[]> {
        const repo = InvitationRepository.getRepository();
        return repo.find({
            where: {
                account: { id: accountId },
                status: 'pending',
                expiresAt: MoreThan(new Date())
            },
            select: getInvitationSelectOptions(),
            relations: {
                invitedBy: true,
                account: true
            }
        });
    }
} 