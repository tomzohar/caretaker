import UserController from "../user/user.controller";
import {UserLoginFailed, UserNotFoundError} from "../user/user.erros";
import SessionService from "../../services/session.service";
import { UserRecord } from '../../entities/user/user.entity';

export class LoginController {
    static async login(email: string, password: string): Promise<{ token: string, user: UserRecord }> {
        const user = await UserController.findByEmail(email, {password: true});
        if (!user) {
            throw new UserNotFoundError();
        }

        if (user.password !== password) {
            throw new UserLoginFailed();
        }

        const userToSend = Object.assign({}, user);
        delete userToSend.password;

        const sessionToken = await SessionService.createSession(user?.id as number);
        return {token: sessionToken, user: userToSend};
    }
}
