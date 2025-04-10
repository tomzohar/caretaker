import { useState } from 'react';
import { AccountApiService } from '../services/account-api.service';

export interface AccountSearchResult {
  account: {
    id: number;
    name: string;
    slug: string;
    usersCount: number;
  } | null;
}

export function useCheckAccountExists() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkAccountExists = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AccountApiService.checkAccountExists(name);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check account');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { checkAccountExists, loading, error };
}

export function useJoinAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const joinAccount = async (accountId: number) => {
    setLoading(true);
    setError(null);
    try {
      const account = await AccountApiService.joinAccount(accountId);
      return account;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to join account');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { joinAccount, loading, error };
} 