import request from 'supertest';
import express from 'express';
import healthRouter from './health.routes';

describe('Health Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use('/health', healthRouter);
    });

    describe('GET /health', () => {
        it('should return 200 with health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual({
                healthy: true,
                message: 'Hello there'
            });
        });

        it('should call next middleware', async () => {
            const nextMiddleware = jest.fn((req, res) => {
                res.end();
            });

            app.use('/health', nextMiddleware);

            await request(app)
                .get('/health')
                .expect(200);

            expect(nextMiddleware).toHaveBeenCalled();
        });

        it('should handle multiple requests', async () => {
            // Make multiple concurrent requests
            const requests = Array(3).fill(null).map(() => 
                request(app)
                    .get('/health')
                    .expect(200)
                    .expect('Content-Type', /json/)
            );

            const responses = await Promise.all(requests);

            responses.forEach(response => {
                expect(response.body).toEqual({
                    healthy: true,
                    message: 'Hello there'
                });
            });
        });
    });
}); 