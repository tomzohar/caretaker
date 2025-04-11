// Unmock the service we're testing
jest.unmock('./invitation-cleanup.service');

// Mock AppDataSource
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn()
    }
}));

// Mock Time service
const mockDays = jest.fn().mockReturnValue(7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
jest.mock('./time.service', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        days: mockDays
    }))
}));

// Mock node-cron
jest.mock('node-cron', () => ({
    schedule: jest.fn()
}));

import { InvitationCleanupService } from './invitation-cleanup.service';
import { AppDataSource } from '../config/database';
import { InvitationRecord } from '../entities/invitation/invitation.entity';
import { LessThan, Repository } from 'typeorm';

describe('InvitationCleanupService', () => {
    let mockRepository: jest.Mocked<Pick<Repository<InvitationRecord>, 'update'>>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock AppDataSource.getRepository to return our mock repository
        (AppDataSource.getRepository as jest.Mock).mockImplementation((entity: any) => {
            if (entity === InvitationRecord) {
                return mockRepository;
            }
            throw new Error('Unexpected entity type');
        });

        // Mock current date
        jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-01').getTime());
    });

    afterEach(() => {
        jest.restoreAllMocks();
        InvitationCleanupService.stopCleanupSchedule();
    });

    describe('runCleanupNow', () => {
        it('should mark recently expired invitations as expired and soft delete old ones', async () => {
            mockRepository = {
                update: jest.fn()
                    .mockResolvedValueOnce({ affected: 1 }) // First call (mark as expired)
                    .mockResolvedValueOnce({ affected: 1 }) // Second call (soft delete)
            };
            await InvitationCleanupService.runCleanupNow();

            expect(mockRepository.update).toHaveBeenCalledTimes(2);
            expect(mockRepository.update).toHaveBeenNthCalledWith(1,
                {
                    status: 'pending',
                    expiresAt: LessThan(expect.any(Date))
                },
                { status: 'expired' }
            );
            expect(mockRepository.update).toHaveBeenNthCalledWith(2,
                {
                    status: 'expired',
                    updatedAt: LessThan(expect.any(Date)),
                    deletedAt: null
                },
                { deletedAt: expect.any(Date) }
            );
        });

        it('should handle errors during cleanup', async () => {
            const error = new Error('Database error');
            mockRepository.update.mockRejectedValueOnce(error);

            await expect(InvitationCleanupService.runCleanupNow()).rejects.toThrow(error);
        });
    });
}); 