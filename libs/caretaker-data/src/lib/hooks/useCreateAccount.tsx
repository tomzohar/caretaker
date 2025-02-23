import { useMutation } from '@tanstack/react-query';
import { Account } from '@caretaker/caretaker-types';
import { AccountApiService } from '../services/account-api.service';

export const useCreateAccount = () => {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (accountDetails: Partial<Account>) =>
      await AccountApiService.createAccount(accountDetails),
  });

  if (error) {
    console.log(error);
  }

  return {
    createAccount: mutateAsync,
    loading: isPending,
    error,
  }
};
