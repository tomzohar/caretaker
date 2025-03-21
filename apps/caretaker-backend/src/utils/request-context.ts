import { Request } from 'express';
import {AuthenticatedRequest} from "../types";

export const getRequestContext = (request: Request): AuthenticatedRequest['context'] | null => {
    return 'context' in request ? request.context as AuthenticatedRequest['context'] : null;
}
