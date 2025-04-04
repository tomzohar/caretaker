import { Request, Response } from 'express';
import logRequestMiddleware from './logRequestMiddleware';
import { StatusCode } from '../../types';

describe('logRequestMiddleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        // Setup request mock
        mockReq = {
            method: 'GET',
            path: '/test'
        };

        // Setup response mock
        mockRes = {
            statusCode: StatusCode.OK
        };

        // Setup next function mock
        mockNext = jest.fn();

        // Setup console.log spy
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        jest.clearAllMocks();
    });

    it('should call next()', () => {
        logRequestMiddleware(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should log request with success status code', (done) => {
        mockRes.statusCode = StatusCode.OK;
        
        logRequestMiddleware(mockReq as Request, mockRes as Response, mockNext);
        
        // Since the logging happens in setTimeout, we need to wait
        setTimeout(() => {
            expect(consoleLogSpy).toHaveBeenCalled();
            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toContain('GET');
            expect(logCall).toContain('/test');
            expect(logCall).toContain('200');
            done();
        }, 0);
    });

    it('should log request with error status code', (done) => {
        mockRes.statusCode = StatusCode.BAD_REQUEST;
        
        logRequestMiddleware(mockReq as Request, mockRes as Response, mockNext);
        
        setTimeout(() => {
            expect(consoleLogSpy).toHaveBeenCalled();
            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toContain('GET');
            expect(logCall).toContain('/test');
            expect(logCall).toContain('400');
            done();
        }, 0);
    });

    it('should include timestamp in log', (done) => {
        logRequestMiddleware(mockReq as Request, mockRes as Response, mockNext);
        
        setTimeout(() => {
            expect(consoleLogSpy).toHaveBeenCalled();
            const logCall = consoleLogSpy.mock.calls[0][0];
            expect(logCall).toMatch(/\[\w{3}, \d{2} \w{3} \d{4}/); // Match UTC date format
            done();
        }, 0);
    });
}); 