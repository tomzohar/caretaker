import {Request} from 'express';

export type AuthContext = {
    userName: string;
    userId: number;
    userEmail: string;
};

export interface AuthenticatedRequest extends Request {
    context: AuthContext;
}
