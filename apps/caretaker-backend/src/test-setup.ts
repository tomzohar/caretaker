import { jest } from '@jest/globals';
import { DataSource, Repository } from 'typeorm';
import { Redis } from 'ioredis';

// Mock Redis client
const mockRedisClient = {
  connect: jest.fn<() => Promise<'OK'>>(() => Promise.resolve('OK')),
  disconnect: jest.fn<() => Promise<'OK'>>(() => Promise.resolve('OK')),
  get: jest.fn<(key: string) => Promise<string | null>>(() => Promise.resolve(null)),
  set: jest.fn<(key: string, value: string) => Promise<'OK'>>(() => Promise.resolve('OK')),
} as unknown as Redis;

jest.mock('./cache/redis-client', () => ({
  __esModule: true,
  default: mockRedisClient,
}));

// Mock TypeORM's AppDataSource
const mockRepository = {
  find: jest.fn<() => Promise<any[]>>(() => Promise.resolve([])),
  findOne: jest.fn<() => Promise<any | null>>(() => Promise.resolve(null)),
  save: jest.fn<(entity: any) => Promise<any>>((entity) => Promise.resolve({ id: 1, ...entity })),
} as unknown as Repository<any>;

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