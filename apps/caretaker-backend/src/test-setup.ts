import { jest } from '@jest/globals';
import { DataSource, Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { UserRecord } from './entities/user/user.entity';

// Mock Redis client
const mockRedisClient = {
  connect: jest.fn<() => Promise<'OK'>>(() => Promise.resolve('OK')),
  disconnect: jest.fn<() => Promise<'OK'>>(() => Promise.resolve('OK')),
  get: jest.fn<(key: string) => Promise<string | null>>(() => Promise.resolve(null)),
  set: jest.fn<(key: string, value: string) => Promise<'OK'>>(() => Promise.resolve('OK')),
  del: jest.fn<(key: string) => Promise<number>>(() => Promise.resolve(1)),
  setEx: jest.fn<(key: string, seconds: number, value: string) => Promise<'OK'>>(() => Promise.resolve('OK')),
} as unknown as Redis;

jest.mock('./cache/redis-client', () => ({
  __esModule: true,
  default: mockRedisClient,
}));

// Mock InvitationCleanupService
jest.mock('./services/invitation-cleanup.service', () => ({
  InvitationCleanupService: {
    startCleanupSchedule: jest.fn(),
    stopCleanupSchedule: jest.fn(),
    runCleanupNow: jest.fn(),
  },
}));

// Mock TypeORM's AppDataSource
const mockRepository = {
  find: jest.fn<() => Promise<UserRecord[]>>(() => Promise.resolve([])),
  findOne: jest.fn<() => Promise<UserRecord | null>>(() => Promise.resolve(null)),
  save: jest.fn<(entity: Partial<UserRecord>) => Promise<UserRecord>>((entity) => Promise.resolve({ id: 1, ...entity } as UserRecord)),
} as unknown as Repository<UserRecord>;

const mockDataSource = {
  initialize: jest.fn<() => Promise<DataSource>>(() => 
    Promise.resolve({
      isInitialized: true,
      manager: mockRepository,
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as unknown as DataSource)
  ),
  destroy: jest.fn<() => Promise<void>>(() => Promise.resolve()),
  manager: mockRepository,
  getRepository: jest.fn().mockReturnValue(mockRepository),
} as unknown as DataSource;

jest.mock('./config/database', () => ({
  __esModule: true,
  AppDataSource: mockDataSource,
})); 