import * as bcrypt from 'bcrypt';
import UserController from "../user/user.controller";
import {UserLoginFailed, UserNotFoundError} from "../user/user.erros";
import SessionService, { PendingAccountError } from "../../services/session.service";
import { UserRecord } from '../../entities/user/user.entity';

export class LoginController {
    static async login(email: string, password: string, isPending?: boolean): Promise<{ token: string, user: UserRecord, isPending?: boolean }> {
        const user = await UserController.findByEmail(email, {password: true});
        if (!user) {
            throw new UserNotFoundError();
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UserLoginFailed();
        }

        const userToSend = Object.assign({}, user);
        delete userToSend.password;

        try {
            const sessionToken = await SessionService.createSession(user?.id as number, isPending);
            return {token: sessionToken, user: userToSend};
        } catch (err) {
            if (err instanceof PendingAccountError) {
                // Return a special response for pending users
                return {
                    token: '', // No session token for pending users
                    user: userToSend,
                    isPending: true
                };
            }
            throw err;
        }
    }
}
