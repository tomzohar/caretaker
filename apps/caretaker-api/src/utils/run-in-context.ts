import {NextFunction, Request, RequestHandler, Response} from "express";
import {AuthContext, StatusCode} from "../types";
import {getRequestContext} from "./request-context";

export type RequestHandlerWithContextParams = {req: Request, res: Response, next: NextFunction, context: AuthContext};

export type RequestHandlerWithContext = (handler: RequestHandlerWithContextParams) => void | Promise<void>;

export default function runInContext(callback: RequestHandlerWithContext): RequestHandler {
    return (req, res, next) => {
        const context = getRequestContext(req);
        if (!context) {
            res.send(StatusCode.UNAUTHORIZED).json({error: 'Unauthorized'});
            return;
        }
        return callback({req, res, next, context});
    }
}
