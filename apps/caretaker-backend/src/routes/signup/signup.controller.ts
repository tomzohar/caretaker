import jwt from 'jsonwebtoken';
import UserController from '../user/user.controller';
import { UserCreationError } from '../user/user.erros';
import { QueryFailedError } from 'typeorm';
import { UserRecord } from '../../entities/user/user.entity';
import redisClient from '../../cache/redis-client';
import { LoginController } from '../login/login.controller';

// Use a fallback secret if environment variable is missing
// IMPORTANT: This should be a temporary fix until proper secrets are configured
const SIGNUP_TOKEN_SECRET = process.env.SIGNUP_TOKEN_SECRET || 'temporary_development_secret_replace_in_production';
console.log('Using signup token secret:', SIGNUP_TOKEN_SECRET ? 'Secret configured' : 'NO SECRET CONFIGURED - USING DEFAULT');

const getSignupTokenCacheKey = ({ email }: { email: string }) => {
  return `signup_token_${JSON.stringify({ email })}`;
};

class SignupController {
  private static _instances = 0;

  constructor() {
    SignupController._instances++;
    if (SignupController._instances > 1) {
      throw new Error('Cannot instantiate singleton class using constructor');
    }
  }

  async getUserSignupToken({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const token = jwt.sign(
      {
        email,
        password,
      },
      SIGNUP_TOKEN_SECRET,
      {
        expiresIn: '1h',
      }
    );
    await redisClient.setEx(getSignupTokenCacheKey({ email }), 600, token);
    return token;
  }

  async completeSignupProcess({
    token,
    name,
  }: {
    token: string;
    name: string;
  }): Promise<{ user: UserRecord; token: string }> {
    try {
      const decoded = jwt.verify(token, SIGNUP_TOKEN_SECRET);
      const { email, password } = decoded as Pick<UserRecord, 'email' | 'password'>;

      const cachedToken = await redisClient.get(
        getSignupTokenCacheKey({ email })
      );

      if (cachedToken !== token) {
        throw new Error('Invalid token');
      }

      // Create user without account
      const user = await UserController.createUser({ 
        email, 
        password, 
        name
      });
      
      await redisClient.del(getSignupTokenCacheKey({ email }));
      return LoginController.login(email, password, true);
    } catch (err) {
      console.log(err);
      throw new UserCreationError(err as QueryFailedError);
    }
  }
}

const signupController = new SignupController();
export default signupController;
