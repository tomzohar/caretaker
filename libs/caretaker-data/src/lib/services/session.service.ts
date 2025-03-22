import { User } from '@caretaker/caretaker-types';
import { UserApiService } from './user-api.service';

export class SessionService {
  static readonly TOKEN_KEY = 'session_token';

  public static setToken(token: string): void {
    window.sessionStorage.setItem(SessionService.TOKEN_KEY, token);
  }

  public static getToken(): string | null {
    return window.sessionStorage.getItem(SessionService.TOKEN_KEY);
  }

  public static removeToken(): void {
    window.sessionStorage.removeItem(SessionService.TOKEN_KEY);
  }

  public static async validateSession(): Promise<User | null> {
    if (!SessionService.getToken()) {
      return null;
    }

    try {
      const user = await UserApiService.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Failed to validate session:', error);
      SessionService.removeToken();
      return null;
    }
  }

  public static async createSession(payload: { email: string; password: string }) {
    try {
      const {user, token} = await UserApiService.login(payload)
      if (token) {
        SessionService.setToken(token);
        return user;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
    return null;
  }

  public static logout() {
    SessionService.removeToken();
  }
}
