import { HttpService } from '../http-service/http-service';
import { User } from '@caretaker/caretaker-types';

export class UserApiService {
  public static async getCurrentUser(): Promise<User> {
    const response = await HttpService.get<{
      user: User;
      expired: boolean;
      error: string;
    }>('/api/users/me');
    if (response.expired) {
      throw new Error(response.error);
    }
    return response.user;
  }

  public static async login(payload: { email: string; password: string }) {
    return await HttpService.post<{
      user: User;
      token: string;
    }>('/api/login/email', payload);
  }

  public static async signup(param: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await HttpService.post<{ token: string }>(
      '/api/signup/email',
      {
        email: param.email,
        password: param.password,
      }
    );
    if (response.token) {
      const { user, token } = await HttpService.post<{
        user: User;
        token: string;
      }>('/api/signup/complete', {
        name: param.firstName + ' ' + param.lastName,
        token: response.token,
      });
      console.log({ user, token });
      sessionStorage.setItem('session_token', token);
      return user;
    }
  }
}
