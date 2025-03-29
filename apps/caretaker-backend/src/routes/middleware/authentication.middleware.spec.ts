import request from 'supertest';
import express from 'express';
import authenticationMiddleware from './authentication.middleware';
import SessionService from '../../services/session.service';
import { StatusCode } from '../../types';

// Mock SessionService
jest.mock('../../services/session.service', () => ({
    __esModule: true,
    default: {
        isExpiredToken: jest.fn(),
        isValidToken: jest.fn(),
        parseSession: jest.fn()
    }
}));

describe('Authentication Middleware', () => {
    let app: express.Application;
    const mockSessionService = SessionService as jest.Mocked<typeof SessionService>;
    const mockUser = {
        name: 'Test User',
        id: 123,
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        iat: Date.now()
    };

    beforeEach(() => {
        app = express();
        // Add authentication middleware
        app.use(authenticationMiddleware);
        // Add a test route
        app.get('/test', (req, res) => res.json({ success: true }));

        // Reset all mocks
        jest.clearAllMocks();
    });

    it('should return 401 when no token is provided', async () => {
        await request(app)
            .get('/test')
            .expect(StatusCode.UNAUTHORIZED)
            .expect(res => {
                expect(res.body.error).toBe('Unauthorized');
            });
    });

    it('should return 401 when token is invalid', async () => {
        mockSessionService.isExpiredToken.mockReturnValue(false);
        mockSessionService.isValidToken.mockResolvedValue(false);

        await request(app)
            .get('/test')
            .set('Authorization', 'Bearer invalid-token')
            .expect(StatusCode.UNAUTHORIZED)
            .expect(res => {
                expect(res.body.expired).toBe(true);
                expect(res.body.error).toBe('Session expired, please login again');
            });
    });

    it('should return 401 when token is expired', async () => {
        mockSessionService.isExpiredToken.mockReturnValue(true);
        mockSessionService.isValidToken.mockResolvedValue(true);

        await request(app)
            .get('/test')
            .set('Authorization', 'Bearer expired-token')
            .expect(StatusCode.UNAUTHORIZED)
            .expect(res => {
                expect(res.body.expired).toBe(true);
                expect(res.body.error).toBe('Session expired, please login again');
            });
    });

    it('should allow request with valid token', async () => {
        mockSessionService.isExpiredToken.mockReturnValue(false);
        mockSessionService.isValidToken.mockResolvedValue(true);
        mockSessionService.parseSession.mockReturnValue(mockUser);

        await request(app)
            .get('/test')
            .set('Authorization', 'Bearer valid-token')
            .expect(StatusCode.OK)
            .expect(res => {
                expect(res.body.success).toBe(true);
            });
    });

    it('should set user context on request with valid token', async () => {
        mockSessionService.isExpiredToken.mockReturnValue(false);
        mockSessionService.isValidToken.mockResolvedValue(true);
        mockSessionService.parseSession.mockReturnValue(mockUser);

        // Replace the test route to check the context
        app = express();
        app.use(authenticationMiddleware);
        app.get('/test', (req: any, res) => {
            expect(req.context).toBeDefined();
            expect(req.context.userName).toBe(mockUser.name);
            expect(req.context.userId).toBe(mockUser.id);
            expect(req.context.userEmail).toBe(mockUser.email);
            res.json({ success: true });
        });

        await request(app)
            .get('/test')
            .set('Authorization', 'Bearer valid-token')
            .expect(StatusCode.OK);
    });

    it('should handle lowercase authorization header', async () => {
        mockSessionService.isExpiredToken.mockReturnValue(false);
        mockSessionService.isValidToken.mockResolvedValue(true);
        mockSessionService.parseSession.mockReturnValue(mockUser);

        await request(app)
            .get('/test')
            .set('authorization', 'Bearer valid-token')
            .expect(StatusCode.OK);
    });

    it('should strip "Bearer" prefix from token', async () => {
        mockSessionService.isExpiredToken.mockReturnValue(false);
        mockSessionService.isValidToken.mockResolvedValue(true);
        mockSessionService.parseSession.mockReturnValue(mockUser);

        await request(app)
            .get('/test')
            .set('Authorization', 'Bearer valid-token')
            .expect(StatusCode.OK);

        // Check that the Bearer prefix was stripped
        const calls = mockSessionService.isExpiredToken.mock.calls;
        expect(calls[0][0]).toBe('valid-token');
    });
}); 