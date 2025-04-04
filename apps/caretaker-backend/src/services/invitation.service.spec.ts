import { InvitationRecord } from '../entities/invitation/invitation.entity';
import { UserRecord } from '../entities/user/user.entity';
import { InvitationService } from './invitation.service';
import {
    DuplicateInvitationError,
    InvitationAlreadyAcceptedError,
    InvitationExpiredError,
    InvitationNotFoundError
} from '../entities/invitation/invitation.errors';
import AccountRecord from '../entities/account/account.entity';
import { AppDataSource } from '../config/database';

// Mock AppDataSource
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn()
    }
}));

describe('InvitationService', () => {
    const now = new Date();
    
    // Mock data
    const mockAccount: AccountRecord = {
        id: 1,
        name: 'Test Account',
        slug: 'test-account',
        users: []
    };

    const mockUser: UserRecord = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        posts: [],
        patients: [],
        account: mockAccount,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        deletedAt: null
    };

    const mockInvitation: InvitationRecord = {
        id: 1,
        email: 'invited@example.com',
        token: 'test-token',
        status: 'pending' as const,
        invitedBy: mockUser,
        account: mockAccount,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: now,
        updatedAt: now,
        deletedAt: null
    };

    // Mock repository methods
    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        findOneBy: jest.fn()
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Setup AppDataSource mock
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

        // Reset default mock implementations
        mockRepository.create.mockReturnValue(mockInvitation);
        mockRepository.save.mockResolvedValue(mockInvitation);
        mockRepository.findOne.mockResolvedValue(mockInvitation);
        mockRepository.find.mockResolvedValue([mockInvitation]);
        mockRepository.update.mockResolvedValue({ affected: 1 });
        mockRepository.findOneBy.mockResolvedValue(mockInvitation);
    });

    describe('createInvitation', () => {
        it('should create a new invitation when no pending invitation exists', async () => {
            // Mock no existing invitations
            mockRepository.find.mockResolvedValueOnce([]);
            mockRepository.create.mockReturnValueOnce(mockInvitation);
            mockRepository.save.mockResolvedValueOnce(mockInvitation);

            const result = await InvitationService.createInvitation(
                mockInvitation.email,
                mockUser,
                mockUser.account.id
            );

            expect(result).toEqual(mockInvitation);
            expect(mockRepository.find).toHaveBeenCalled();
            expect(mockRepository.create).toHaveBeenCalled();
            expect(mockRepository.save).toHaveBeenCalledWith(mockInvitation);
        });

        it('should throw DuplicateInvitationError when pending invitation exists', async () => {
            // Mock existing pending invitation
            mockRepository.find.mockResolvedValueOnce([mockInvitation]);

            await expect(
                InvitationService.createInvitation(
                    mockInvitation.email,
                    mockUser,
                    mockUser.account.id
                )
            ).rejects.toThrow(DuplicateInvitationError);

            expect(mockRepository.find).toHaveBeenCalled();
            expect(mockRepository.create).not.toHaveBeenCalled();
            expect(mockRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('validateInvitation', () => {
        it('should validate a valid invitation', async () => {
            mockRepository.findOne.mockResolvedValueOnce(mockInvitation);

            const result = await InvitationService.validateInvitation(mockInvitation.token);

            expect(result).toEqual(mockInvitation);
            expect(mockRepository.findOne).toHaveBeenCalled();
        });

        it('should throw InvitationNotFoundError when invitation does not exist', async () => {
            mockRepository.findOne.mockResolvedValueOnce(null);

            await expect(
                InvitationService.validateInvitation('non-existent-token')
            ).rejects.toThrow(InvitationNotFoundError);

            expect(mockRepository.findOne).toHaveBeenCalled();
        });

        it('should throw InvitationAlreadyAcceptedError when invitation is accepted', async () => {
            const acceptedInvitation = {
                ...mockInvitation,
                status: 'accepted' as const
            };
            mockRepository.findOne.mockResolvedValueOnce(acceptedInvitation);

            await expect(
                InvitationService.validateInvitation(mockInvitation.token)
            ).rejects.toThrow(InvitationAlreadyAcceptedError);

            expect(mockRepository.findOne).toHaveBeenCalled();
        });

        it('should throw InvitationExpiredError when invitation is expired', async () => {
            const expiredInvitation = {
                ...mockInvitation,
                expiresAt: new Date(now.getTime() - 1000) // Expired 1 second ago
            };
            mockRepository.findOne.mockResolvedValueOnce(expiredInvitation);
            mockRepository.update.mockResolvedValueOnce({ affected: 1 });
            mockRepository.findOneBy.mockResolvedValueOnce({ ...expiredInvitation, status: 'expired' as const });

            await expect(
                InvitationService.validateInvitation(mockInvitation.token)
            ).rejects.toThrow(InvitationExpiredError);

            expect(mockRepository.findOne).toHaveBeenCalled();
            expect(mockRepository.update).toHaveBeenCalled();
        });
    });

    describe('acceptInvitation', () => {
        it('should accept a valid invitation', async () => {
            mockRepository.findOne.mockResolvedValueOnce(mockInvitation);
            const acceptedInvitation = {
                ...mockInvitation,
                status: 'accepted' as const
            };
            mockRepository.update.mockResolvedValueOnce({ affected: 1 });
            mockRepository.findOneBy.mockResolvedValueOnce(acceptedInvitation);

            const result = await InvitationService.acceptInvitation(mockInvitation.token);

            expect(result).toEqual(acceptedInvitation);
            expect(mockRepository.findOne).toHaveBeenCalled();
            expect(mockRepository.update).toHaveBeenCalled();
            expect(mockRepository.findOneBy).toHaveBeenCalled();
        });

        it('should throw error when invitation is invalid', async () => {
            mockRepository.findOne.mockResolvedValueOnce(null);

            await expect(
                InvitationService.acceptInvitation('invalid-token')
            ).rejects.toThrow(InvitationNotFoundError);

            expect(mockRepository.findOne).toHaveBeenCalled();
            expect(mockRepository.update).not.toHaveBeenCalled();
            expect(mockRepository.findOneBy).not.toHaveBeenCalled();
        });
    });

    describe('getPendingInvitations', () => {
        it('should return pending invitations for an account', async () => {
            const pendingInvitations = [mockInvitation];
            mockRepository.find.mockResolvedValueOnce(pendingInvitations);

            const result = await InvitationService.getPendingInvitations(mockUser.account.id);

            expect(result).toEqual(pendingInvitations);
            expect(mockRepository.find).toHaveBeenCalled();
        });

        it('should return empty array when no pending invitations exist', async () => {
            mockRepository.find.mockResolvedValueOnce([]);

            const result = await InvitationService.getPendingInvitations(mockUser.account.id);

            expect(result).toEqual([]);
            expect(mockRepository.find).toHaveBeenCalled();
        });
    });
}); 