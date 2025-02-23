import {NextFunction, Request, RequestHandler, Response} from 'express';
import SessionService from "../../services/session.service";
import {StatusCode} from "../../types";

const AUTHORIZATION_HEADER_KEY = 'Authorization';

const getAuthorizationHeaderValue = (headers: Record<string, unknown>) => {
    const headerValue = <string | null>(
        headers[AUTHORIZATION_HEADER_KEY] ||
        headers[AUTHORIZATION_HEADER_KEY.toLowerCase()]
    );
    if (!headerValue) {
        return null;
    }
    return headerValue.replace('Bearer', '').trim();
};

const authenticationMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const token = getAuthorizationHeaderValue(req.headers);
    if (!token) {
        res.status(StatusCode.UNAUTHORIZED).json({error: 'Unauthorized'});
        return;
    }
    const isExpired = SessionService.isExpiredToken(token);
    const isValid = await SessionService.isValidToken(token);
    if (!isValid || isExpired) {
        res.status(StatusCode.UNAUTHORIZED).json({
            expired: true,
            error: 'Session expired, please login again'
        });
        return;
    }

    const tokenData = SessionService.parseSession(token);
    const {name: userName, id: userId, email: userEmail} = tokenData;
    Object.assign(req, {
        context: {
            userName,
            userId,
            userEmail,
        }
    });
    next();
};

export default authenticationMiddleware;
