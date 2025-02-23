import { Account } from '../account/account.interface';

export interface User {
  id: number;
  name: string;
  email: string;
  account: Account;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}
